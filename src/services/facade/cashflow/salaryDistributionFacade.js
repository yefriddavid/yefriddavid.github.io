import * as idb from '../../idb/cashflow/salaryDistribution'
import * as fb from '../../firebase/cashflow/salaryDistribution'

export const getConfig = idb.getConfig
export const saveConfig = idb.saveConfig

export const syncToFirebase = async (distributions) => {
  await fb.syncAllToFirebase(distributions)
  const now = new Date().toISOString()
  const synced = distributions.map((d) => ({ ...d, syncedAt: now }))
  await idb.saveConfig(synced)
  return synced
}

export const importFromFirebase = async () => {
  const distributions = await fb.fetchAllFromFirebase()
  await idb.saveConfig(distributions)
  return distributions
}
