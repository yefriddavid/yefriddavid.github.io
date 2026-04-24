import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, COL_DOMOTICA_SOLAR } from '../settings'

const BATTERY_DOC = 'battery'

/**
 * Real-time subscription to battery status.
 * The external system writes to Domotica_Solar/battery.
 *
 * Expected document fields:
 *   voltage    {number}  e.g. 12.4  (V)
 *   soc        {number}  0–100      (State of Charge %)
 *   current    {number}  e.g. 4.2   (A, positive = charging, negative = discharging)
 *   power      {number}  e.g. 52.1  (W)
 *   status     {string}  'charging' | 'discharging' | 'full' | 'idle' | 'low'
 *   temperature {number} e.g. 28    (°C, optional)
 *   updatedAt  {Timestamp}
 *
 * @param {(data: object|null) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const subscribeBatteryStatus = (callback) => {
  const ref = doc(db, COL_DOMOTICA_SOLAR, BATTERY_DOC)
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

/**
 * Write a battery status update (for testing or local device integration).
 * @param {object} data
 */
export const updateBatteryStatus = (data) =>
  setDoc(doc(db, COL_DOMOTICA_SOLAR, BATTERY_DOC), {
    ...data,
    updatedAt: serverTimestamp(),
  })
