import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/inmobiliaria/designActions'
import * as service from '../../services/facade/inmobiliaria/designFacade'
import { push as notify } from '../../reducers/notificationsSlice'

function* loadDesign({ payload }) {
  try {
    yield put(actions.beginRequestLoad())
    const data = yield call(service.getDesign, payload.id)
    yield put(actions.successRequestLoad(data))
  } catch (e) {
    yield put(actions.errorRequestLoad(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

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

function* createDesign({ payload: { navigate, ...data } }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addDesign, data)
    yield put(actions.successRequestCreate({ id, ...data }))
    yield put(notify({ type: 'success', message: 'Diseño creado correctamente.' }))
    if (navigate) navigate(`/inmobiliaria/designs/${id}`, { replace: true })
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* updateDesign({ payload: { navigate, ...rest } }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateDesign, rest.id, rest.data)
    yield put(actions.successRequestUpdate({ id: rest.id, ...rest.data }))
    yield put(notify({ type: 'success', message: 'Diseño actualizado.' }))
    if (navigate) navigate('/inmobiliaria/designs')
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* cloneDesign({ payload: { id, name } }) {
  try {
    yield put(actions.beginRequestClone())
    const original = yield call(service.getDesign, id)
    const { id: _id, ...rest } = original
    const newId = yield call(service.addDesign, { ...rest, name })
    yield put(actions.successRequestClone({ id: newId, ...rest, name }))
    yield put(notify({ type: 'success', message: `Diseño "${name}" clonado correctamente.` }))
  } catch (e) {
    yield put(actions.errorRequestClone(e.message))
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
    takeLatest(actions.loadRequest, loadDesign),
    takeLatest(actions.fetchRequest, fetchDesigns),
    takeLatest(actions.createRequest, createDesign),
    takeLatest(actions.updateRequest, updateDesign),
    takeLatest(actions.cloneRequest, cloneDesign),
    takeLatest(actions.deleteRequest, deleteDesign),
  ])
}
