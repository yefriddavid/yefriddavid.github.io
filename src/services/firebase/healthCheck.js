import { doc, getDoc } from 'firebase/firestore'
import { db } from './settings'

// Lightweight connectivity probe — reads a known non-existent doc (no data transferred)
export const checkFirebaseConnectivity = async () => {
  try {
    await getDoc(doc(db, '_health', 'ping'))
    return true
  } catch (err) {
    if (err.code === 'permission-denied' || err.code === 'not-found') return true
    return false
  }
}
