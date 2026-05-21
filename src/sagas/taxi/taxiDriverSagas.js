import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiDriverActions'
import * as service from '../../services/facade/taxi/taxiDriverFacade'
import { push as notify } from '../../reducers/notificationsSlice'

export function* fetchDrivers() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getDrivers)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createDriver({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addDriver, payload)
    yield put(
      actions.successRequestCreate({
        id,
        ...payload,
        defaultAmount: payload.defaultAmount ? Number(payload.defaultAmount) : null,
        defaultAmountSunday: payload.defaultAmountSunday
          ? Number(payload.defaultAmountSunday)
          : null,
        defaultVehicle: payload.defaultVehicle || null,
      }),
    )
    yield put(notify({ type: 'success', message: 'Conductor creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al crear el conductor: ${e.message}` }))
  }
}

export function* updateDriver({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateDriver, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Conductor actualizado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar: ${e.message}` }))
  }
}

export function* deleteDriver({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteDriver, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Conductor eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDrivers),
    takeLatest(actions.createRequest, createDriver),
    takeLatest(actions.updateRequest, updateDriver),
    takeLatest(actions.deleteRequest, deleteDriver),
  ])
}
