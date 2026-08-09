import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/programActions'
import * as service from '../../services/firebase/system/programs'
import { push as notify } from '../../reducers/notificationsSlice'

export function* fetchPrograms() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPrograms)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createProgram({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addProgram, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Programa creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al crear el programa: ${e.message}` }))
  }
}

export function* updateProgram({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    const { id, ...data } = payload
    yield call(service.updateProgram, id, data)
    yield put(actions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Programa actualizado.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar el programa: ${e.message}` }))
  }
}

export function* deleteProgram({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteProgram, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Programa eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar el programa: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchPrograms),
    takeLatest(actions.createRequest, createProgram),
    takeLatest(actions.updateRequest, updateProgram),
    takeLatest(actions.deleteRequest, deleteProgram),
  ])
}
