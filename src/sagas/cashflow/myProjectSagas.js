import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/cashflow/myProjectActions'
import * as facade from '../../services/facade/cashflow/myProjectFacade'
import { push } from '../../reducers/notificationsSlice'

function* loadProjects() {
  try {
    const projects = yield call(facade.getAllProjects)
    yield put(actions.loadSuccess(projects))
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

function* syncProject({ payload }) {
  try {
    const result = yield call(facade.syncProject, payload)
    yield put(actions.syncSuccess(result))
  } catch (e) {
    yield put(actions.syncError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* syncAllProjects({ payload }) {
  try {
    const result = yield call(facade.syncAll, payload)
    yield put(actions.syncAllSuccess(result))
  } catch (e) {
    yield put(actions.syncAllError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* importFromFirebase() {
  try {
    const projects = yield call(facade.importFromFirebase)
    yield put(actions.importSuccess(projects))
  } catch (e) {
    yield put(actions.importError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.loadRequest, loadProjects),
    takeEvery(actions.saveRequest, saveProject),
    takeLatest(actions.deleteRequest, deleteProject),
    takeLatest(actions.syncRequest, syncProject),
    takeLatest(actions.syncAllRequest, syncAllProjects),
    takeLatest(actions.importRequest, importFromFirebase),
  ])
}
