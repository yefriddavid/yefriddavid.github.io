import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/salaryDistributionActions'
import * as service from '../../services/providers/indexeddb/CashFlow/salaryDistribution'
import * as fb from '../../services/providers/firebase/CashFlow/salaryDistribution'

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

function* syncToFirebase({ payload }) {
  try {
    yield call(fb.syncAllToFirebase, payload)
    const now = new Date().toISOString()
    const synced = payload.map((d) => ({ ...d, syncedAt: now }))
    yield call(service.saveConfig, synced)
    yield put(actions.syncSuccess(synced))
  } catch (e) {
    yield put(actions.syncError(e.message))
  }
}

function* importFromFirebase() {
  try {
    const distributions = yield call(fb.fetchAllFromFirebase)
    yield call(service.saveConfig, distributions)
    yield put(actions.importSuccess(distributions))
  } catch (e) {
    yield put(actions.importError(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchConfig),
    takeLatest(actions.saveRequest, saveConfig),
    takeLatest(actions.syncRequest, syncToFirebase),
    takeLatest(actions.importRequest, importFromFirebase),
  ])
}
