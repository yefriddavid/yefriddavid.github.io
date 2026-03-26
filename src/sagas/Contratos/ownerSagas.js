import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Contratos/ownerActions'
import * as service from '../../services/providers/firebase/Contratos/owners'

function* fetchOwners() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getOwners)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createOwner({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addOwner, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateOwner({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateOwner, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteOwner({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteOwner, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchOwners),
    takeLatest(actions.createRequest, createOwner),
    takeLatest(actions.updateRequest, updateOwner),
    takeLatest(actions.deleteRequest, deleteOwner),
  ])
}
