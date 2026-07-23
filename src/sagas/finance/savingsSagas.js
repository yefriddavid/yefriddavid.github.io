import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/finance/savingsActions'
import * as service from '../../services/firebase/finance/savings'
import { push } from '../../reducers/notificationsSlice'

function* loadSavings() {
  try {
    const savings = yield call(service.fetchAll)
    yield put(actions.loadSuccess(savings))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveSaving({ payload }) {
  try {
    const id = yield call(service.saveEntry, payload)
    yield put(actions.saveSuccess({ ...payload, id }))
    yield put(push({ type: 'success', message: 'Ahorro registrado correctamente.' }))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* updateSaving({ payload }) {
  try {
    yield call(service.updateEntry, payload)
    yield put(actions.updateSuccess(payload))
    yield put(push({ type: 'success', message: 'Ahorro actualizado correctamente.' }))
  } catch (e) {
    yield put(actions.updateError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteSaving({ payload }) {
  try {
    yield call(service.deleteEntry, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
    yield put(push({ type: 'success', message: 'Ahorro eliminado correctamente.' }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* sagaSavings() {
  yield all([
    takeLatest(actions.loadRequest, loadSavings),
    takeEvery(actions.saveRequest, saveSaving),
    takeEvery(actions.updateRequest, updateSaving),
    takeLatest(actions.deleteRequest, deleteSaving),
  ])
}
