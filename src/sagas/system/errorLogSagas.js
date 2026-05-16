import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/errorLogActions'
import * as service from '../../services/firebase/system/errorLogs'

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

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchErrorLogs),
    takeLatest(actions.deleteRequest, deleteErrorLog),
  ])
}
