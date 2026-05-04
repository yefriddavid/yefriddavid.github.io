import { put, call, all, takeLatest, takeEvery, select } from 'redux-saga/effects'
import * as actions from '../../actions/finance/customGridTradeActions'
import * as fb from '../../services/firebase/finance/customGridTrades'
import * as idb from '../../services/indexeddb/finance/customGridTrades'

const svc = (useIndexedDB) => (useIndexedDB ? idb : fb)

function* loadTrades() {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    const trades = yield call(svc(useIndexedDB).fetchAll)
    yield put(actions.loadSuccess(trades))
  } catch (e) {
    yield put(actions.loadError(e.message))
  }
}

function* saveTrade({ payload }) {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    const id = yield call(svc(useIndexedDB).saveTrade, payload)
    yield put(actions.saveSuccess({ ...payload, id }))
  } catch (e) {
    yield put(actions.saveError(e.message))
  }
}

function* deleteTrade({ payload }) {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    yield call(svc(useIndexedDB).deleteTrade, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
  }
}

function* bulkImport({ payload }) {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    for (const trade of payload) {
      yield call(svc(useIndexedDB).saveTrade, trade)
    }
    const trades = yield call(svc(useIndexedDB).fetchAll)
    yield put(actions.bulkImportSuccess(trades))
  } catch (e) {
    yield put(actions.bulkImportError(e.message))
  }
}

function* syncTrades() {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    const source = svc(useIndexedDB)
    const dest = svc(!useIndexedDB)
    const trades = yield call(source.fetchAll)
    for (const trade of trades) {
      yield call(dest.saveTrade, trade)
    }
    yield put(actions.syncSuccess())
  } catch (e) {
    yield put(actions.syncError(e.message))
  }
}

function* deleteAllTrades() {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    yield call(svc(useIndexedDB).deleteAll)
    yield put(actions.deleteAllSuccess())
  } catch (e) {
    yield put(actions.deleteAllError(e.message))
  }
}

export default function* sagaCustomGridTrades() {
  yield all([
    takeLatest(actions.loadRequest, loadTrades),
    takeEvery(actions.saveRequest, saveTrade),
    takeLatest(actions.deleteRequest, deleteTrade),
    takeLatest(actions.bulkImportRequest, bulkImport),
    takeLatest(actions.syncRequest, syncTrades),
    takeLatest(actions.deleteAllRequest, deleteAllTrades),
  ])
}
