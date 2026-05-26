import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/inmobiliaria/designActions'
import * as service from '../../services/facade/inmobiliaria/designFacade'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchDesigns() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getDesigns)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* createDesign({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addDesign, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Diseño creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* updateDesign({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateDesign, payload.id, payload.data)
    yield put(actions.successRequestUpdate({ id: payload.id, ...payload.data }))
    yield put(notify({ type: 'success', message: 'Diseño actualizado.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* deleteDesign({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteDesign, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Diseño eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDesigns),
    takeLatest(actions.createRequest, createDesign),
    takeLatest(actions.updateRequest, updateDesign),
    takeLatest(actions.deleteRequest, deleteDesign),
  ])
}
