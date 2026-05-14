import { put, call, all, takeLatest, takeEvery, select } from 'redux-saga/effects'
import * as actions from '../../actions/finance/customGridTradeActions'
import * as facade from '../../services/facade/finance/customGridTradeFacade'
import { push } from '../../reducers/notificationsSlice'

function* loadTrades() {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    const trades = yield call(facade.fetchAll, useIndexedDB)
    yield put(actions.loadSuccess(trades))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveTrade({ payload }) {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    const id = yield call(facade.saveTrade, useIndexedDB, payload)
    yield put(actions.saveSuccess({ ...payload, id }))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteTrade({ payload }) {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    yield call(facade.deleteTrade, useIndexedDB, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* bulkImport({ payload }) {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    const trades = yield call(facade.bulkImport, useIndexedDB, payload)
    yield put(actions.bulkImportSuccess(trades))
  } catch (e) {
    yield put(actions.bulkImportError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* syncTrades() {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    yield call(facade.syncTrades, useIndexedDB)
    yield put(actions.syncSuccess())
  } catch (e) {
    yield put(actions.syncError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteAllTrades() {
  try {
    const useIndexedDB = yield select((s) => s.customGridTrade.useIndexedDB)
    yield call(facade.deleteAll, useIndexedDB)
    yield put(actions.deleteAllSuccess())
  } catch (e) {
    yield put(actions.deleteAllError(e.message))
    yield put(push({ type: 'error', message: e.message }))
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
