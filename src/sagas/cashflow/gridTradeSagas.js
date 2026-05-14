import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/cashflow/gridTradeActions'
import * as fb from '../../services/facade/cashflow/gridTradeFacade'
import { push } from '../../reducers/notificationsSlice'

function* loadTrades() {
  try {
    const trades = yield call(fb.fetchAll)
    yield put(actions.loadSuccess(trades))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveTrade({ payload }) {
  try {
    const id = yield call(fb.saveTrade, payload)
    yield put(actions.saveSuccess({ ...payload, id }))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteTrade({ payload }) {
  try {
    yield call(fb.deleteTrade, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.loadRequest, loadTrades),
    takeEvery(actions.saveRequest, saveTrade),
    takeLatest(actions.deleteRequest, deleteTrade),
  ])
}
