import { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as a from 'src/actions/finance/calcListActions'
import * as signaling from 'src/services/firebase/finance/syncSessions'

export const STATUS = {
  IDLE:       'idle',
  CONNECTING: 'connecting',
  CONNECTED:  'connected',
  SYNCED:     'synced',
  ERROR:      'error',
}

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export default function usePeerSync() {
  const dispatch = useDispatch()
  const lists = useSelector((s) => s.calcList.lists)
  const listsRef = useRef(lists)
  useEffect(() => { listsRef.current = lists }, [lists])

  const [myId] = useState(() => crypto.randomUUID())
  const [status, setStatus] = useState(STATUS.IDLE)
  const [error, setError]   = useState(null)

  const callerPcRef = useRef(null)
  const calleePcRef = useRef(null)
  const unsubsRef   = useRef([])

  const setupChannel = useCallback((channel) => {
    channel.onopen = () => {
      setStatus(STATUS.CONNECTED)
      channel.send(JSON.stringify({ type: 'sync', lists: listsRef.current }))
    }
    channel.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg?.type === 'sync') {
          dispatch(a.mergeRequest(msg.lists))
          setStatus(STATUS.SYNCED)
        }
      } catch {}
    }
    channel.onclose = () => setStatus(STATUS.IDLE)
    channel.onerror = () => setStatus(STATUS.ERROR)
  }, [dispatch])

  // On mount: become the caller — create a Firestore session with our offer so others can connect.
  useEffect(() => {
    let alive = true

    const init = async () => {
      try {
        await signaling.createSession(myId)

        const pc = new RTCPeerConnection(RTC_CONFIG)
        callerPcRef.current = pc

        setupChannel(pc.createDataChannel('sync'))

        pc.onicecandidate = (e) => {
          if (e.candidate && alive)
            signaling.addCandidate(myId, 'offer', e.candidate).catch(() => {})
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        await signaling.writeOffer(myId, offer.sdp)

        // Candidates arriving before remote description is set are queued and drained after.
        const pendingCandidates = []
        let remoteDescReady = false

        const drainCandidates = () => {
          pendingCandidates.splice(0).forEach((c) =>
            pc.addIceCandidate(c).catch(() => {})
          )
        }

        const unsubSession = signaling.subscribeSession(myId, (snap) => {
          if (!alive) return
          const { answerSdp } = snap.data() ?? {}
          if (answerSdp && !pc.currentRemoteDescription) {
            setStatus(STATUS.CONNECTING)
            pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
              .then(() => { remoteDescReady = true; drainCandidates() })
              .catch((err) => { setError(err.message); setStatus(STATUS.ERROR) })
          }
        })

        const unsubCandidates = signaling.subscribeCandidates(myId, 'answer', (snap) => {
          snap.docChanges().forEach(({ type, doc }) => {
            if (type !== 'added' || !alive) return
            const candidate = new RTCIceCandidate(doc.data())
            if (remoteDescReady) pc.addIceCandidate(candidate).catch(() => {})
            else pendingCandidates.push(candidate)
          })
        })

        unsubsRef.current.push(unsubSession, unsubCandidates)
      } catch (err) {
        if (alive) { setError(err.message); setStatus(STATUS.ERROR) }
      }
    }

    init()

    return () => {
      alive = false
      unsubsRef.current.forEach((u) => u())
      unsubsRef.current = []
      callerPcRef.current?.close()
      calleePcRef.current?.close()
      signaling.deleteSession(myId).catch(() => {})
    }
  }, [myId, setupChannel])

  // connectTo: become the callee for another device's session.
  const connectTo = useCallback(async (remoteId) => {
    try {
      setStatus(STATUS.CONNECTING)
      setError(null)
      calleePcRef.current?.close()

      const pc = new RTCPeerConnection(RTC_CONFIG)
      calleePcRef.current = pc

      pc.ondatachannel = (e) => setupChannel(e.channel)

      pc.onicecandidate = (e) => {
        if (e.candidate)
          signaling.addCandidate(remoteId, 'answer', e.candidate).catch(() => {})
      }

      const snap = await signaling.getSession(remoteId)
      if (!snap.exists()) throw new Error('Sesión no encontrada')

      const { offerSdp } = snap.data()
      if (!offerSdp) throw new Error('El otro dispositivo aún no está listo')

      await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp })

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await signaling.writeAnswer(remoteId, answer.sdp)

      const unsubCandidates = signaling.subscribeCandidates(remoteId, 'offer', (snap) => {
        snap.docChanges().forEach(({ type, doc }) => {
          if (type === 'added')
            pc.addIceCandidate(new RTCIceCandidate(doc.data())).catch(() => {})
        })
      })
      unsubsRef.current.push(unsubCandidates)

    } catch (err) {
      setError(err.message)
      setStatus(STATUS.ERROR)
    }
  }, [setupChannel])

  const disconnect = useCallback(() => {
    calleePcRef.current?.close()
    calleePcRef.current = null
    setStatus(STATUS.IDLE)
  }, [])

  return { myId, status, error, connectTo, disconnect }
}
