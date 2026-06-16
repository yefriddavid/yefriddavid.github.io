import { put, call, takeLatest, takeEvery } from 'redux-saga/effects'
import * as a from '../../actions/finance/loanActions'
import * as idb from '../../services/indexeddb/finance/loans'
import { push } from '../../reducers/notificationsSlice'

function* loadLoans() {
  try {
    const records = yield call(idb.fetchAll)
    yield put(a.loadSuccess(records))
  } catch (e) {
    yield put(a.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveLoan({ payload }) {
  try {
    const saved = yield call(idb.saveLoan, payload)
    yield put(a.saveSuccess(saved))
    yield put(push({ type: 'success', message: 'Préstamo guardado.' }))
  } catch (e) {
    yield put(a.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteLoan({ payload: id }) {
  try {
    yield call(idb.deleteLoan, id)
    yield put(a.deleteSuccess(id))
    yield put(push({ type: 'success', message: 'Préstamo eliminado.' }))
  } catch (e) {
    yield put(a.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* loanSagas() {
  yield takeLatest(a.loadRequest, loadLoans)
  yield takeEvery(a.saveRequest, saveLoan)
  yield takeEvery(a.deleteRequest, deleteLoan)
}
