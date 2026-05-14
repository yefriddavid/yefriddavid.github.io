import * as idb from '../../idb/cashflow/assets'
import * as fb from '../../firebase/cashflow/assets'

export const fetchAll = fb.fetchAll
export const createAsset = fb.createAsset
export const syncAssetToFirebase = fb.syncAssetToFirebase

export const deleteAsset = async (id) => {
  await idb.deleteAsset(id)
  await fb.deleteAssetFromFirebase(id)
}

export const syncAll = async (assets) => {
  const now = new Date().toISOString()
  for (const asset of assets) {
    await fb.syncAssetToFirebase(asset)
    await idb.saveAsset({ ...asset, syncedAt: now })
  }
  return assets.map((a) => ({ id: a.id, syncedAt: now }))
}

export const importFromFirebase = async () => {
  const assets = await fb.fetchAll()
  for (const asset of assets) await idb.saveAsset(asset)
  return assets
}

export { saveAsset } from '../../idb/cashflow/assets'
