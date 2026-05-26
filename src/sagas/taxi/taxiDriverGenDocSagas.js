import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiDriverGenDocActions'
import * as service from '../../services/facade/taxi/taxiDriverGenDocsFacade'
import { push as notify } from '../../reducers/notificationsSlice'

export function* fetchDriverGenDocs({ payload: driverId }) {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getDriverGenDocs, driverId)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createDriverGenDoc({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addDriverGenDoc, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Documento guardado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al guardar el documento: ${e.message}` }))
  }
}

export function* updateDriverGenDoc({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateDriverGenDoc, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Documento actualizado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar: ${e.message}` }))
  }
}

export function* deleteDriverGenDoc({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteDriverGenDoc, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Documento eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDriverGenDocs),
    takeLatest(actions.createRequest, createDriverGenDoc),
    takeLatest(actions.updateRequest, updateDriverGenDoc),
    takeLatest(actions.deleteRequest, deleteDriverGenDoc),
  ])
}
