import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/inmobiliaria/planosActions'
import * as service from '../../services/facade/inmobiliaria/planosFacade'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchPlanos() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPlanos)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* loadPlano({ payload }) {
  try {
    yield put(actions.beginRequestLoad())
    const data = yield call(service.getPlano, payload.id)
    yield put(actions.successRequestLoad(data))
  } catch (e) {
    yield put(actions.errorRequestLoad(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* createPlano({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addPlano, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Plano creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* updatePlano({ payload: { id, data } }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updatePlano, id, data)
    yield put(actions.successRequestUpdate({ id, ...data }))
    yield put(notify({ type: 'success', message: 'Plano guardado.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* deletePlano({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deletePlano, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Plano eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchPlanos),
    takeLatest(actions.loadRequest, loadPlano),
    takeLatest(actions.createRequest, createPlano),
    takeLatest(actions.updateRequest, updatePlano),
    takeLatest(actions.deleteRequest, deletePlano),
  ])
}
