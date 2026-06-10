import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/usageMetricsActions'
import * as service from '../../services/firebase/admin/usageMetrics'

function* fetchUsageMetrics() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.fetchCollectionCounts)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export default function* rootSagas() {
  yield all([takeLatest(actions.fetchRequest, fetchUsageMetrics)])
}
