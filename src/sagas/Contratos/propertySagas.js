import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Contratos/propertyActions'
import * as service from '../../services/providers/firebase/Contratos/properties'

function* fetchProperties() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getProperties)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createProperty({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addProperty, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateProperty({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateProperty, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteProperty({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteProperty, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchProperties),
    takeLatest(actions.createRequest, createProperty),
    takeLatest(actions.updateRequest, updateProperty),
    takeLatest(actions.deleteRequest, deleteProperty),
  ])
}
