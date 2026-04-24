const lastPersistTime = new Map()
const THROTTLE_MS = 30_000

export function shouldPersist(vehicleId) {
  const last = lastPersistTime.get(vehicleId) ?? 0
  if (Date.now() - last >= THROTTLE_MS) {
    lastPersistTime.set(vehicleId, Date.now())
    return true
  }
  return false
}
