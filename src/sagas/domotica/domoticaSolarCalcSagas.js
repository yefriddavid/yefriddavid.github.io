import { put, call, all, takeLatest } from 'redux-saga/effects'
import { push as notify } from '../../reducers/notificationsSlice'
import * as actions from '../../actions/domotica/domoticaSolarCalcActions'
import * as facade from '../../services/facade/domotica/domoticaSolarCalcFacade'

function* fetchConfigs() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(facade.fetchSolarCalcConfigs)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createConfig({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(facade.createSolarCalcConfig, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Configuración guardada.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al guardar: ${e.message}` }))
  }
}

function* updateConfig({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(facade.updateSolarCalcConfig, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Configuración actualizada.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar: ${e.message}` }))
  }
}

function* deleteConfig({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(facade.deleteSolarCalcConfig, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Configuración eliminada.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchConfigs),
    takeLatest(actions.createRequest, createConfig),
    takeLatest(actions.updateRequest, updateConfig),
    takeLatest(actions.deleteRequest, deleteConfig),
  ])
}
