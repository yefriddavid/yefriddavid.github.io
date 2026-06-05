import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/taskActions'
import * as facade from '../../services/facade/tasks'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchTasks() {
  try {
    const localTasks = yield call(facade.getLocalTasks)
    yield put(actions.successRequestFetch(localTasks))

    const { tasks, pendingLocal } = yield call(facade.refreshFromFirebase, localTasks)

    if (tasks) yield put(actions.successRequestFetch(tasks))

    if (pendingLocal?.length) {
      const synced = yield call(facade.syncPendingTasks, pendingLocal)
      if (synced.length) {
        yield put(actions.syncPendingSuccess(synced))
        yield put(notify({ type: 'info', message: `${synced.length} tarea(s) offline sincronizadas.` }))
      }
    }
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* saveTask({ payload }) {
  try {
    const result = yield call(facade.saveTask, payload)
    yield put(actions.successRequestSave(result))
  } catch (e) {
    yield put(actions.errorRequestSave(e.message))
    yield put(notify({ type: 'error', message: `Error al guardar: ${e.message}` }))
  }
}

function* deleteTask({ payload }) {
  try {
    yield call(facade.deleteTask, payload)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchTasks),
    takeEvery(actions.saveRequest, saveTask),
    takeEvery(actions.deleteRequest, deleteTask),
  ])
}
