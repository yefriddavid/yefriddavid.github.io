import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiVehicleActions'
import * as service from '../../services/facade/taxi/taxiVehicleFacade'
import { push as notify } from '../../reducers/notificationsSlice'

export function* fetchVehicles() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getVehicles)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createVehicle({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addVehicle, payload)
    yield put(
      actions.successRequestCreate({
        id,
        ...payload,
        plate: payload.plate?.toUpperCase(),
        restrictions: {},
      }),
    )
    yield put(notify({ type: 'success', message: 'Vehículo creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al crear el vehículo: ${e.message}` }))
  }
}

export function* updateVehicle({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateVehicle, payload.id, payload)
    yield put(actions.successRequestUpdate({ ...payload, plate: payload.plate?.toUpperCase() }))
    yield put(notify({ type: 'success', message: 'Vehículo actualizado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar: ${e.message}` }))
  }
}

export function* deleteVehicle({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteVehicle, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Vehículo eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export function* updateRestrictions({ payload }) {
  try {
    yield call(service.updateRestrictions, payload.id, payload.restrictions)
    yield put(actions.successRequestUpdateRestrictions(payload))
    yield put(notify({ type: 'success', message: 'Restricciones guardadas correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdateRestrictions(e.message))
    yield put(notify({ type: 'error', message: `Error al guardar restricciones: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchVehicles),
    takeLatest(actions.createRequest, createVehicle),
    takeLatest(actions.updateRequest, updateVehicle),
    takeLatest(actions.deleteRequest, deleteVehicle),
    takeLatest(actions.updateRestrictionsRequest, updateRestrictions),
  ])
}
