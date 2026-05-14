import * as fb from '../../firebase/finance/customGridTrades'
import * as idb from '../../indexeddb/finance/customGridTrades'

const backend = (useIndexedDB) => (useIndexedDB ? idb : fb)

export const fetchAll = (useIndexedDB) => backend(useIndexedDB).fetchAll()
export const saveTrade = (useIndexedDB, trade) => backend(useIndexedDB).saveTrade(trade)
export const deleteTrade = (useIndexedDB, id) => backend(useIndexedDB).deleteTrade(id)
export const deleteAll = (useIndexedDB) => backend(useIndexedDB).deleteAll()

export const bulkImport = async (useIndexedDB, trades) => {
  const be = backend(useIndexedDB)
  for (const trade of trades) await be.saveTrade(trade)
  return be.fetchAll()
}

export const syncTrades = async (useIndexedDB) => {
  const source = backend(useIndexedDB)
  const dest = backend(!useIndexedDB)
  const trades = await source.fetchAll()
  for (const trade of trades) await dest.saveTrade(trade)
}
