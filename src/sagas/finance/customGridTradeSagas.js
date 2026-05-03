import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/finance/customGridTradeActions'
import * as fb from '../../services/firebase/finance/customGridTrades'

function* loadTrades() {
  try {
    const trades = yield call(fb.fetchAll)
    yield put(actions.loadSuccess(trades))
  } catch (e) {
    yield put(actions.loadError(e.message))
  }
}

function* saveTrade({ payload }) {
  try {
    const id = yield call(fb.saveTrade, payload)
    yield put(actions.saveSuccess({ ...payload, id }))
  } catch (e) {
    yield put(actions.saveError(e.message))
  }
}

function* deleteTrade({ payload }) {
  try {
    yield call(fb.deleteTrade, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
  }
}

export default function* sagaCustomGridTrades() {
  yield all([
    takeLatest(actions.loadRequest, loadTrades),
    takeEvery(actions.saveRequest, saveTrade),
    takeLatest(actions.deleteRequest, deleteTrade),
  ])
}
