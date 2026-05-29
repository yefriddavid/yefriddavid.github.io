import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/finance/scenes3dActions'
import * as service from '../../services/facade/finance/scenes3dFacade'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchScenes() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getScenes3d)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* loadScene({ payload }) {
  try {
    yield put(actions.beginRequestLoad())
    const data = yield call(service.getScene3d, payload.id)
    yield put(actions.successRequestLoad(data))
  } catch (e) {
    yield put(actions.errorRequestLoad(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* createScene({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addScene3d, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Escena creada correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* updateScene({ payload: { id, data } }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateScene3d, id, data)
    yield put(actions.successRequestUpdate({ id, ...data }))
    yield put(notify({ type: 'success', message: 'Escena guardada.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* deleteScene({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteScene3d, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Escena eliminada.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchScenes),
    takeLatest(actions.loadRequest, loadScene),
    takeLatest(actions.createRequest, createScene),
    takeLatest(actions.updateRequest, updateScene),
    takeLatest(actions.deleteRequest, deleteScene),
  ])
}
