import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/cashflow/salaryDistributionActions'
import * as facade from '../../services/facade/cashflow/salaryDistributionFacade'
import { push } from '../../reducers/notificationsSlice'

function* fetchConfig() {
  try {
    yield put(actions.beginRequestFetch())

    // 1. Show local data immediately — no network wait
    const localRecord = yield call(facade.getLocalConfig)
    yield put(actions.successRequestFetch(localRecord?.data ?? null))

    // 2. Check Firebase in background — screen already rendered
    const { distributions, needsSync } = yield call(facade.refreshFromFirebase, localRecord)

    if (needsSync) {
      // IDB is newer → auto-sync offline changes to Firebase
      const synced = yield call(facade.saveConfig, distributions)
      yield put(actions.successRequestFetch(synced))
      yield put(push({ type: 'info', message: 'Cambios offline sincronizados con Firebase.' }))
    } else if (distributions) {
      // Firebase is newer → update silently
      yield put(actions.successRequestFetch(distributions))
    }
    // distributions null = no internet, keep local data already shown
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveConfig({ payload }) {
  try {
    yield put(actions.beginRequestSave())
    const result = yield call(facade.saveConfig, payload)
    yield put(actions.successRequestSave(result))
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
