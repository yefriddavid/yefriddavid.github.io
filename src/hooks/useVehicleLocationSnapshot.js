import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from 'src/services/firebase/settings'
import { getTenantId } from 'src/services/tenantContext'
import * as currentPositionsActions from 'src/actions/taxi/currentPositionsActions'

const COL = 'Taxi_vehicle_location_history'

export function useVehicleLocationSnapshot() {
  const dispatch = useDispatch()

  useEffect(() => {
    const tenantId = getTenantId()
    if (!tenantId) return

    const q = query(
      collection(db, COL),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'desc'),
      limit(20),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type !== 'added') return
          const entry = change.doc.data()
          if (!entry.vehicleId) return
          // Ignore wss-sourced docs to prevent write loop
          if (entry.source === 'wss') return

          const lastUpdate =
            entry.timestamp?.toDate?.()?.toISOString() ??
            entry.timestamp ??
            new Date().toISOString()

          dispatch(
            currentPositionsActions.updateFromApp({
              vehicleId: entry.vehicleId,
              lat: parseFloat(entry.latitude),
              lng: parseFloat(entry.longitude),
              lastUpdate,
            }),
          )
        })
      },
      (error) => {
        console.error('useVehicleLocationSnapshot:', error.code, error.message)
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          signOut(auth).catch(() => {})
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          localStorage.removeItem('sessionId')
          localStorage.removeItem('landingPage')
          window.location.hash = '#/login'
        }
        // Transient errors (unavailable, deadline-exceeded): Firestore retries automatically
      },
    )

    return () => unsubscribe()
  }, [dispatch])
}
