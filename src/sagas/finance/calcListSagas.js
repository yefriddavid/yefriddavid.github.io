import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/finance/calcListActions'
import * as idb from '../../services/indexeddb/finance/calcList'
import { push } from '../../reducers/notificationsSlice'

function* loadRows() {
  try {
    const rows = yield call(idb.fetchAll)
    yield put(actions.loadSuccess(rows))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveRow({ payload }) {
  try {
    const row = yield call(idb.upsertRow, payload)
    yield put(actions.saveSuccess(row))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteRow({ payload }) {
  try {
    yield call(idb.deleteRow, payload)
    yield put(actions.deleteSuccess(payload))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* sagaCalcList() {
  yield all([
    takeLatest(actions.loadRequest, loadRows),
    takeEvery(actions.saveRequest, saveRow),
    takeEvery(actions.deleteRequest, deleteRow),
  ])
}
