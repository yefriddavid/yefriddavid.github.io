import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/finance/increaseDecreaseActions'
import * as service from '../../services/firebase/finance/increaseDecrease'
import { push } from '../../reducers/notificationsSlice'

function* loadEntries() {
  try {
    const entries = yield call(service.fetchAll)
    yield put(actions.loadSuccess(entries))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveEntry({ payload }) {
  try {
    const id = yield call(service.saveEntry, payload)
    yield put(actions.saveSuccess({ ...payload, id }))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteEntry({ payload }) {
  try {
    yield call(service.deleteEntry, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* sagaIncreaseDecrease() {
  yield all([
    takeLatest(actions.loadRequest, loadEntries),
    takeEvery(actions.saveRequest, saveEntry),
    takeLatest(actions.deleteRequest, deleteEntry),
  ])
}
