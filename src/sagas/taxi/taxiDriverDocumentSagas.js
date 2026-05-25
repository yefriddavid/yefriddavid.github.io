import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiDriverDocumentActions'
import * as service from '../../services/facade/taxi/taxiDriverDocumentsFacade'
import { push as notify } from '../../reducers/notificationsSlice'

export function* fetchDriverDocuments() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getDriverDocuments)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createDriverDocument({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addDriverDocument, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Plantilla creada correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al crear la plantilla: ${e.message}` }))
  }
}

export function* updateDriverDocument({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateDriverDocument, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Plantilla actualizada correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar: ${e.message}` }))
  }
}

export function* deleteDriverDocument({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteDriverDocument, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Plantilla eliminada.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDriverDocuments),
    takeLatest(actions.createRequest, createDriverDocument),
    takeLatest(actions.updateRequest, updateDriverDocument),
    takeLatest(actions.deleteRequest, deleteDriverDocument),
  ])
}
