import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/finance/picturesActions'
import * as service from '../../services/facade/finance/picturesFacade'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchPictures() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPictures)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* loadPicture({ payload }) {
  try {
    yield put(actions.beginRequestLoad())
    const data = yield call(service.getPicture, payload.id)
    yield put(actions.successRequestLoad(data))
  } catch (e) {
    yield put(actions.errorRequestLoad(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* createPicture({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addPicture, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Cuadro creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* updatePicture({ payload: { id, data } }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updatePicture, id, data)
    yield put(actions.successRequestUpdate({ id, ...data }))
    yield put(notify({ type: 'success', message: 'Cuadro guardado.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* deletePicture({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deletePicture, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Cuadro eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchPictures),
    takeLatest(actions.loadRequest, loadPicture),
    takeLatest(actions.createRequest, createPicture),
    takeLatest(actions.updateRequest, updatePicture),
    takeLatest(actions.deleteRequest, deletePicture),
  ])
}
