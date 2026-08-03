import { Subject } from 'rxjs'
import * as signaling from '../../firebase/finance/syncSessions'
import { getCurrentUsername } from '../../firebase/auth'

const HEARTBEAT_MS = 20000
const PRESENCE_STALE_MS = 60000
const GOOGLE_STUN = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]
const getDeviceType = () =>
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'

// Google STUN alone can't traverse networks with client/AP isolation or symmetric
// NAT — confirmed via iceConnectionState going straight to "failed" on such a network.
// Metered.ca issues short-lived TURN credentials over a plain REST call (no SDK); we
// fetch them once per handler lifetime and fall back to STUN-only if unconfigured or
// the request fails, so this stays optional (no hard dependency on the TURN account).
let iceServersPromise = null
function getIceServers() {
  if (!iceServersPromise) {
    iceServersPromise = (async () => {
      const appName = import.meta.env.VITE_TURN_APP_NAME
      const apiKey = import.meta.env.VITE_TURN_API_KEY
      if (!appName || !apiKey) return GOOGLE_STUN
      try {
        const res = await fetch(
          `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`,
        )
        if (!res.ok) throw new Error(`metered.ca responded ${res.status}`)
        const turnServers = await res.json()
        return [...turnServers, ...GOOGLE_STUN]
      } catch (err) {
        console.error('TURN credentials fetch failed, falling back to STUN-only:', err.message)
        return GOOGLE_STUN
      }
    })()
  }
  return iceServersPromise
}

// ponytail: temporary diagnostic logging while chasing the "presence sees a peer but
// the WebRTC data channel never opens" report — remove once the real cause is found.
const log = (...args) => console.log('[calcList-sync]', ...args)

// Side-channel exposed to calcList.js / the facade / the UI — populated once the
// connectionHandlerCreator below actually runs (only in the leader tab, see
// replicateWebRTC's own waitForLeadership() gate).
const presenceState = { myId: null, peers: [] }
const presenceListeners = new Set()
const emitPresence = (peers) => {
  presenceState.peers = peers
  presenceListeners.forEach((cb) => cb(peers))
}

export const getMyId = () => presenceState.myId

export const subscribePeers = (cb) => {
  cb(presenceState.peers)
  presenceListeners.add(cb)
  return () => presenceListeners.delete(cb)
}

let activeConnectTo = null
// Manual override (SyncModal QR/typed-ID, PresenceModal "Sincronizar" button) — calls
// the exact same connectTo the automatic tie-break below would eventually call,
// immediately instead of waiting for presence-driven discovery.
export const connectTo = (remoteId) =>
  activeConnectTo ? activeConnectTo(remoteId) : Promise.resolve()

// Custom RxDB WebRTC connectionHandlerCreator: reuses the existing raw
// RTCPeerConnection + Firestore signaling (syncSessions.js) instead of RxDB's default
// simple-peer + hosted signaling server, so no new dependency and no external service.
export async function createCalcListWebrtcHandler(options) {
  const rxCollection = options.collection

  const connect$ = new Subject()
  const disconnect$ = new Subject()
  const message$ = new Subject()
  const response$ = new Subject()
  const error$ = new Subject()

  const myId = crypto.randomUUID()
  const username = getCurrentUsername()
  const deviceType = getDeviceType()

  const peers = new Map()
  const pending = new Set()
  const unsubs = []
  let closed = false

  presenceState.myId = myId

  const getDataVersion = async () => {
    const docs = await rxCollection.find().exec()
    return docs.reduce((max, d) => (d.updatedAt > max ? d.updatedAt : max), '')
  }

  function setupChannel(remoteId, channel, pc) {
    const peer = { id: remoteId, dataChannel: channel, pc }
    pc.oniceconnectionstatechange = () => log('iceConnectionState', remoteId, pc.iceConnectionState)
    pc.onconnectionstatechange = () => log('connectionState', remoteId, pc.connectionState)
    pc.onicegatheringstatechange = () => log('iceGatheringState', remoteId, pc.iceGatheringState)
    channel.onopen = () => {
      log('dataChannel OPEN', remoteId)
      pending.delete(remoteId)
      peers.set(remoteId, peer)
      connect$.next(peer)
    }
    channel.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        if ('result' in parsed || 'error' in parsed) response$.next({ peer, response: parsed })
        else message$.next({ peer, message: parsed })
      } catch {}
    }
    const onGone = (e) => {
      log('dataChannel gone', remoteId, e?.type)
      pending.delete(remoteId)
      if (peers.has(remoteId)) {
        peers.delete(remoteId)
        disconnect$.next(peer)
      }
      pc.close()
    }
    channel.onclose = onGone
    channel.onerror = onGone
  }

  // Caller side — dial a specific peer (auto tie-break or manual connectTo).
  async function doConnectTo(remoteId) {
    if (closed || remoteId === myId || peers.has(remoteId) || pending.has(remoteId)) return
    log('doConnectTo start', remoteId)
    pending.add(remoteId)
    try {
      const pc = new RTCPeerConnection({ iceServers: await getIceServers() })
      setupChannel(remoteId, pc.createDataChannel('sync'), pc)

      let candidateCount = 0
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          candidateCount++
          log(
            'caller ICE candidate',
            remoteId,
            candidateCount,
            e.candidate.type,
            e.candidate.protocol,
          )
          signaling
            .addConnectionCandidate(remoteId, myId, 'offer', e.candidate)
            .catch((err) => log('addConnectionCandidate FAILED', err.message))
        } else {
          log('caller ICE gathering done', remoteId, 'total candidates:', candidateCount)
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await signaling.writeConnectionOffer(remoteId, myId, offer.sdp)
      log('offer written', remoteId)

      const pendingCandidates = []
      let remoteReady = false
      const drain = () =>
        pendingCandidates.splice(0).forEach((c) => pc.addIceCandidate(c).catch(() => {}))

      const unsubAnswer = signaling.subscribeConnection(remoteId, myId, (snap) => {
        const answerSdp = snap.data()?.answerSdp
        if (answerSdp && !pc.currentRemoteDescription) {
          log('answer received', remoteId)
          pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
            .then(() => {
              remoteReady = true
              drain()
            })
            .catch((err) => log('setRemoteDescription(answer) FAILED', err.message))
        }
      })
      const unsubCandidates = signaling.subscribeConnectionCandidates(
        remoteId,
        myId,
        'answer',
        (snap) => {
          snap.docChanges().forEach(({ type, doc }) => {
            if (type !== 'added') return
            const candidate = new RTCIceCandidate(doc.data())
            if (remoteReady) pc.addIceCandidate(candidate).catch(() => {})
            else pendingCandidates.push(candidate)
          })
        },
      )
      unsubs.push(unsubAnswer, unsubCandidates)
    } catch (err) {
      log('doConnectTo FAILED', remoteId, err.message)
      pending.delete(remoteId)
      error$.next(err)
    }
  }

  // Callee side — someone else dialed us.
  async function handleIncoming(fromId, offerSdp) {
    if (closed || peers.has(fromId) || pending.has(fromId)) return
    log('handleIncoming start', fromId)
    pending.add(fromId)
    try {
      const pc = new RTCPeerConnection({ iceServers: await getIceServers() })
      pc.ondatachannel = (e) => setupChannel(fromId, e.channel, pc)
      let candidateCount = 0
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          candidateCount++
          log(
            'callee ICE candidate',
            fromId,
            candidateCount,
            e.candidate.type,
            e.candidate.protocol,
          )
          signaling
            .addConnectionCandidate(myId, fromId, 'answer', e.candidate)
            .catch((err) => log('addConnectionCandidate FAILED', err.message))
        } else {
          log('callee ICE gathering done', fromId, 'total candidates:', candidateCount)
        }
      }

      await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await signaling.writeConnectionAnswer(myId, fromId, answer.sdp)
      log('answer written', fromId)

      const unsubCandidates = signaling.subscribeConnectionCandidates(
        myId,
        fromId,
        'offer',
        (snap) => {
          snap.docChanges().forEach(({ type, doc }) => {
            if (type === 'added')
              pc.addIceCandidate(new RTCIceCandidate(doc.data())).catch(() => {})
          })
        },
      )
      unsubs.push(unsubCandidates)
    } catch (err) {
      log('handleIncoming FAILED', fromId, err.message)
      pending.delete(fromId)
      error$.next(err)
    }
  }

  log('handler started, myId =', myId)
  getIceServers().then((servers) =>
    log(
      'ICE servers ready:',
      servers.some((s) => s.urls?.toString().startsWith('turn')) ? 'STUN+TURN' : 'STUN-only',
    ),
  )
  await signaling.createSession(myId, username, deviceType, await getDataVersion())
  const heartbeat = setInterval(async () => {
    try {
      await signaling.touchSession(myId, await getDataVersion())
    } catch {}
  }, HEARTBEAT_MS)

  const unsubIncoming = signaling.subscribeIncoming(myId, (snap) => {
    log('incoming snapshot, docs:', snap.docs.length)
    snap.docChanges().forEach(({ type, doc }) => {
      if (type !== 'added') return
      const { offerSdp } = doc.data()
      log('incoming change', type, doc.id, 'hasOffer:', !!offerSdp)
      if (offerSdp) handleIncoming(doc.id, offerSdp)
    })
  })

  // Auto-sync with every online peer. Tie-break (myId > peer.id initiates) avoids
  // both sides dialing each other at once — mirrors RxDB's own reference connection
  // handler (connection-handler-simple-peer.js: `initiator: remotePeerId > ownPeerId`).
  const unsubPresence = signaling.subscribePresence((snap) => {
    const cutoff = Date.now() - PRESENCE_STALE_MS
    const list = []
    // Session docs only get deleted on a graceful unmount (deleteSession in close()),
    // which real usage rarely triggers cleanly (tab close, mobile backgrounding, crash,
    // navigating away). Left alone, this collection grows forever and every device has
    // to download/filter the whole thing on every presence tick. Delete stale entries
    // opportunistically here instead of waiting for a dedicated cleanup job.
    for (const doc of snap.docs) {
      if (doc.id === myId) continue
      const p = { id: doc.id, ...doc.data() }
      const lastSeenMs = p.lastSeen?.toMillis?.() ?? 0
      if (lastSeenMs > cutoff) list.push(p)
      else if (lastSeenMs > 0) signaling.deleteSession(p.id).catch(() => {})
    }
    log(
      'presence snapshot:',
      snap.docs.length,
      'total docs,',
      list.length,
      'fresh peers =',
      list.map((p) => p.id),
    )
    emitPresence(list)
    list.forEach((p) => {
      if (myId > p.id) doConnectTo(p.id)
    })
  })

  activeConnectTo = doConnectTo

  return {
    connect$,
    disconnect$,
    message$,
    response$,
    error$,
    async send(peer, message) {
      peer.dataChannel.send(JSON.stringify(message))
    },
    async close() {
      closed = true
      clearInterval(heartbeat)
      unsubIncoming()
      unsubPresence()
      unsubs.forEach((u) => u())
      peers.forEach((p) => p.pc.close())
      peers.clear()
      pending.clear()
      activeConnectTo = null
      presenceState.myId = null
      emitPresence([])
      await signaling.deleteSession(myId).catch(() => {})
      connect$.complete()
      disconnect$.complete()
      message$.complete()
      response$.complete()
      error$.complete()
    },
  }
}
