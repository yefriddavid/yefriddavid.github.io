import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/myProjectActions'
import * as idb from '../../services/providers/indexeddb/CashFlow/myProjects'
import * as fb from '../../services/providers/firebase/CashFlow/myProjects'

function* loadProjects() {
  try {
    const projects = yield call(idb.getAllProjects)
    yield put(actions.loadSuccess(projects))
  } catch (e) {
    yield put(actions.loadError(e.message))
  }
}

function* saveProject({ payload }) {
  try {
    yield call(idb.saveProject, payload)
    yield put(actions.saveSuccess(payload))
  } catch (e) {
    yield put(actions.saveError(e.message))
  }
}

function* deleteProject({ payload }) {
  try {
    yield call(idb.deleteProject, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
  }
}

function* syncProject({ payload }) {
  try {
    yield call(fb.syncProjectToFirebase, payload)
    const syncedAt = new Date().toISOString()
    const updated = { ...payload, syncedAt }
    yield call(idb.saveProject, updated)
    yield put(actions.syncSuccess({ id: payload.id, syncedAt }))
  } catch (e) {
    yield put(actions.syncError(e.message))
  }
}

function* syncAllProjects({ payload }) {
  try {
    const now = new Date().toISOString()
    for (const project of payload) {
      yield call(fb.syncProjectToFirebase, project)
      yield call(idb.saveProject, { ...project, syncedAt: now })
    }
    const result = payload.map((p) => ({ id: p.id, syncedAt: now }))
    yield put(actions.syncAllSuccess(result))
  } catch (e) {
    yield put(actions.syncAllError(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.loadRequest, loadProjects),
    takeLatest(actions.saveRequest, saveProject),
    takeLatest(actions.deleteRequest, deleteProject),
    takeLatest(actions.syncRequest, syncProject),
    takeLatest(actions.syncAllRequest, syncAllProjects),
  ])
}
