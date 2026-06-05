import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/errorLogActions'
import * as service from '../../services/firebase/system/errorLogs'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchErrorLogs() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getErrorLogs)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* deleteErrorLog({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteErrorLog, payload)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* clearAllErrorLogs() {
  try {
    yield call(service.clearAllErrorLogs)
    yield put(actions.successRequestClearAll())
    yield put(notify({ type: 'success', message: 'Todos los errores han sido eliminados.' }))
  } catch (e) {
    yield put(actions.errorRequestClearAll(e.message))
    yield put(notify({ type: 'error', message: `Error al limpiar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchErrorLogs),
    takeLatest(actions.deleteRequest, deleteErrorLog),
    takeLatest(actions.clearAllRequest, clearAllErrorLogs),
  ])
}
