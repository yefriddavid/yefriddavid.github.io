import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/cashflow/salaryDistributionActions'
import * as facade from '../../services/facade/cashflow/salaryDistributionFacade'
import { push } from '../../reducers/notificationsSlice'

function* fetchConfig() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(facade.getConfig)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveConfig({ payload }) {
  try {
    yield put(actions.beginRequestSave())
    yield call(facade.saveConfig, payload)
    yield put(actions.successRequestSave(payload))
  } catch (e) {
    yield put(actions.errorRequestSave(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* syncToFirebase({ payload }) {
  try {
    const synced = yield call(facade.syncToFirebase, payload)
    yield put(actions.syncSuccess(synced))
  } catch (e) {
    yield put(actions.syncError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* clearLocalConfig() {
  try {
    yield call(facade.saveConfig, null)
    yield put(actions.successRequestFetch(null))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* importFromFirebase() {
  try {
    const distributions = yield call(facade.importFromFirebase)
    yield put(actions.importSuccess(distributions))
  } catch (e) {
    yield put(actions.importError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchConfig),
    takeLatest(actions.saveRequest, saveConfig),
    takeLatest(actions.syncRequest, syncToFirebase),
    takeLatest(actions.importRequest, importFromFirebase),
    takeLatest(actions.clearLocalRequest, clearLocalConfig),
  ])
}
