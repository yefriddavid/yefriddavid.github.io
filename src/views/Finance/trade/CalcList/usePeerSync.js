import { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as a from 'src/actions/finance/calcListActions'

export const STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SYNCED: 'synced',
  ERROR: 'error',
}

export default function usePeerSync() {
  const dispatch = useDispatch()
  const lists = useSelector((s) => s.calcList.lists)
  const listsRef = useRef(lists)
  useEffect(() => { listsRef.current = lists }, [lists])

  const peerRef = useRef(null)
  const connRef = useRef(null)

  const [myId, setMyId]     = useState(null)
  const [status, setStatus] = useState(STATUS.IDLE)
  const [error, setError]   = useState(null)

  // Initialize peer on mount
  useEffect(() => {
    let destroyed = false

    const init = async () => {
      const { Peer } = await import('peerjs')
      const peer = new Peer()
      peerRef.current = peer

      peer.on('open', (id) => {
        if (!destroyed) setMyId(id)
      })

      peer.on('connection', (conn) => {
        connRef.current = conn
        setStatus(STATUS.CONNECTING)
        setupConn(conn)
      })

      peer.on('error', (err) => {
        if (!destroyed) { setError(err.message); setStatus(STATUS.ERROR) }
      })
    }

    init()

    return () => {
      destroyed = true
      connRef.current?.close()
      peerRef.current?.destroy()
    }
  }, [])

  const setupConn = useCallback((conn) => {
    conn.on('open', () => {
      setStatus(STATUS.CONNECTED)
      // send our lists right away
      conn.send({ type: 'sync', lists: listsRef.current })
    })

    conn.on('data', (msg) => {
      if (msg?.type === 'sync') {
        dispatch(a.mergeRequest(msg.lists))
        setStatus(STATUS.SYNCED)
      }
    })

    conn.on('close', () => setStatus(STATUS.IDLE))
    conn.on('error', (err) => { setError(err.message); setStatus(STATUS.ERROR) })
  }, [dispatch])

  const connectTo = useCallback((remoteId) => {
    if (!peerRef.current || !remoteId.trim()) return
    setStatus(STATUS.CONNECTING)
    setError(null)
    const conn = peerRef.current.connect(remoteId.trim())
    connRef.current = conn
    setupConn(conn)
  }, [setupConn])

  const disconnect = useCallback(() => {
    connRef.current?.close()
    setStatus(STATUS.IDLE)
  }, [])

  return { myId, status, error, connectTo, disconnect }
}
