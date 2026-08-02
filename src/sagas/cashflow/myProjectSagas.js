import { put, call, all, take, fork, takeLatest, takeEvery } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import * as actions from '../../actions/cashflow/myProjectActions'
import * as facade from '../../services/facade/cashflow/myProjectFacade'
import { push } from '../../reducers/notificationsSlice'

function createSyncStatusChannel() {
  return eventChannel((emit) => {
    let cancelled = false
    let unsubscribe = () => {}
    facade
      .subscribeSyncStatus((status) => emit(status))
      .then((unsub) => {
        if (cancelled) unsub()
        else unsubscribe = unsub
      })
    return () => {
      cancelled = true
      unsubscribe()
    }
  })
}

function* watchSyncStatus() {
  const channel = yield call(createSyncStatusChannel)
  while (true) {
    const status = yield take(channel)
    yield put(actions.syncStatusChanged(status))
  }
}

let syncStatusWatcherStarted = false

function* loadProjects() {
  try {
    const projects = yield call(facade.getAllProjects)
    yield put(actions.loadSuccess(projects))
    // Started here (not from rootSagas) so getTenantId() is guaranteed resolved.
    if (!syncStatusWatcherStarted) {
      syncStatusWatcherStarted = true
      yield fork(watchSyncStatus)
    }
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveProject({ payload }) {
  try {
    yield call(facade.saveProject, payload)
    yield put(actions.saveSuccess(payload))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteProject({ payload }) {
  try {
    yield call(facade.deleteProject, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.loadRequest, loadProjects),
    takeEvery(actions.saveRequest, saveProject),
    takeLatest(actions.deleteRequest, deleteProject),
  ])
}
