import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/perfLogActions'
import * as service from '../../services/firebase/system/perfLogs'

function* fetchPerfLogs() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPerfLogs)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export default function* rootSagas() {
  yield all([takeLatest(actions.fetchRequest, fetchPerfLogs)])
}
