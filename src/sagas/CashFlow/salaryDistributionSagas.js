import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/salaryDistributionActions'
import * as service from '../../services/providers/indexeddb/CashFlow/salaryDistribution'
// To switch to Firebase, replace the import above with:
// import * as service from '../../services/providers/firebase/CashFlow/salaryDistribution'

function* fetchConfig() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getConfig)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* saveConfig({ payload }) {
  try {
    yield put(actions.beginRequestSave())
    yield call(service.saveConfig, payload)
    yield put(actions.successRequestSave(payload))
  } catch (e) {
    yield put(actions.errorRequestSave(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchConfig),
    takeLatest(actions.saveRequest, saveConfig),
  ])
}
