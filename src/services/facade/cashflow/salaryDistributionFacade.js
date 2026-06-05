import * as idb from '../../idb/cashflow/salaryDistribution'
import * as fb from '../../firebase/cashflow/salaryDistribution'

const latestSyncedAt = (distributions) => {
  const dates = distributions.map((d) => d.syncedAt).filter(Boolean)
  return dates.length ? dates.sort().at(-1) : null
}

// Fix 3: if Firebase has no syncedAt at all, IDB with any savedAt is considered newer
const isIdbNewer = (idbSavedAt, fbSyncedAt) => {
  if (!idbSavedAt) return false
  if (!fbSyncedAt) return true
  return idbSavedAt > fbSyncedAt
}

// Fix 1: read IDB only — instant, no network
export const getLocalConfig = () => idb.getConfig()

// Fix 1: check Firebase separately so it doesn't block local display
export const refreshFromFirebase = async (localRecord) => {
  try {
    const fbData = await fb.fetchAllFromFirebase()
    if (!fbData?.length) return { distributions: null, needsSync: false }

    const idbSavedAt = localRecord?.savedAt ?? null
    const idbData = localRecord?.data ?? null
    const fbSyncedAt = latestSyncedAt(fbData)

    if (idbData?.length && isIdbNewer(idbSavedAt, fbSyncedAt)) {
      return { distributions: idbData, needsSync: true }
    }

    return { distributions: fbData, needsSync: false }
  } catch {
    return { distributions: null, needsSync: false }
  }
}

export const saveConfig = async (distributions) => {
  let result = distributions
  try {
    await fb.syncAllToFirebase(distributions)
    const now = new Date().toISOString()
    result = distributions.map((d) => ({ ...d, syncedAt: now }))
  } catch {
    // no internet — save locally only
  }
  await idb.saveConfig(result)
  return result
}

export const syncToFirebase = async (distributions) => {
  await fb.syncAllToFirebase(distributions)
  const now = new Date().toISOString()
  const synced = distributions.map((d) => ({ ...d, syncedAt: now }))
  await idb.saveConfig(synced)
  return synced
}

// Fix 2: save to IDB with Firebase's own syncedAt as savedAt to avoid false needsSync
export const importFromFirebase = async () => {
  const distributions = await fb.fetchAllFromFirebase()
  const savedAt = latestSyncedAt(distributions) ?? new Date().toISOString()
  await idb.saveConfig(distributions, savedAt)
  return distributions
}
