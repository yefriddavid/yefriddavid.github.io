import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiPartnerActions'
import * as service from '../../services/facade/taxi/taxiPartnerFacade'
import { push as notify } from '../../reducers/notificationsSlice'

export function* fetchPartners() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPartners)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createPartner({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addPartner, payload)
    yield put(
      actions.successRequestCreate({
        id,
        name: payload.name,
        percentage: Number(payload.percentage),
      }),
    )
    yield put(notify({ type: 'success', message: 'Socio creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al crear el socio: ${e.message}` }))
  }
}

export function* updatePartner({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updatePartner, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Socio actualizado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar: ${e.message}` }))
  }
}

export function* deletePartner({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deletePartner, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Socio eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchPartners),
    takeLatest(actions.createRequest, createPartner),
    takeLatest(actions.updateRequest, updatePartner),
    takeLatest(actions.deleteRequest, deletePartner),
  ])
}
