import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import * as facade from 'src/services/facade/finance/calcListFacade'

export const STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SYNCED: 'synced',
  ERROR: 'error',
}

// Sync now runs against Firestore (replicateFirestore), not the WebRTC peer pool —
// CONNECTING/CONNECTED stay defined for SyncModal's label map but are no longer
// emitted; sync is either syncing (push/pull in flight), synced (idle), or errored.
const STATUS_MAP = { syncing: STATUS.CONNECTING, synced: STATUS.SYNCED, error: STATUS.ERROR }

// Latest updatedAt across all groups — the "data version" shown in the presence table.
const getDataVersion = (groups) =>
  groups.reduce((max, g) => (g.updatedAt > max ? g.updatedAt : max), '')

export default function usePeerSync() {
  const groups = useSelector((s) => s.calcList.groups)

  const [myId, setMyId] = useState(null)
  const [status, setStatus] = useState(STATUS.IDLE)
  const [error, setError] = useState(null)
  const [peers, setPeers] = useState([])

  useEffect(() => {
    let alive = true
    let unsubStatus = () => {}
    let unsubPeers = () => {}

    facade
      .subscribeSyncStatus((s) => {
        if (!alive) return
        setStatus(STATUS_MAP[s] ?? STATUS.IDLE)
        setError(s === 'error' ? 'Error de sincronización' : null)
      })
      .then((u) => {
        if (alive) unsubStatus = u
        else u()
      })

    facade
      .subscribePeers((list) => {
        if (!alive) return
        setPeers(list)
        setMyId(facade.getMyId())
      })
      .then((u) => {
        if (alive) unsubPeers = u
        else u()
      })

    return () => {
      alive = false
      unsubStatus()
      unsubPeers()
    }
  }, [])

  const connectTo = useCallback((remoteId) => {
    facade.connectTo(remoteId).catch((err) => setError(err.message))
  }, [])

  return { myId, status, error, peers, myDataVersion: getDataVersion(groups), connectTo }
}
