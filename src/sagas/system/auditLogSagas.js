import { call, all, takeEvery, takeLatest, put } from 'redux-saga/effects'
import * as actions from '../../actions/system/auditLogActions'
import * as service from '../../services/firebase/system/auditLogs'

function* fetchAuditLogs() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getAuditLogs)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* writeLog({ payload }) {
  yield call(service.writeAuditLog, payload)
  yield put(actions.successRequestCreate({ id: `local-${Date.now()}`, ...payload, timestamp: new Date() }))
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchAuditLogs),
    takeEvery(actions.logRequest, writeLog),
  ])
}
