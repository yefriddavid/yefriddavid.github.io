import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/contratos/contractActions'
import * as service from '../../services/firebase/contratos/contracts'

function* fetchContracts() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getContracts)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* loadContract({ payload }) {
  try {
    yield put(actions.beginRequestLoad())
    const data = yield call(service.getContract, payload.id)
    yield put(actions.successRequestLoad(data))
  } catch (e) {
    yield put(actions.errorRequestLoad(e.message))
  }
}

function* createContract({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addContract, payload.name, payload.data)
    yield put(actions.successRequestCreate({ id, name: payload.name, ...payload.data }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateContract({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateContract, payload.id, payload.data)
    yield put(actions.successRequestUpdate({ id: payload.id, ...payload.data }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* cloneContract({ payload }) {
  try {
    yield put(actions.beginRequestClone())
    const result = yield call(service.cloneContract, payload.sourceId, payload.name)
    const full = yield call(service.getContract, result.id)
    yield put(actions.successRequestClone(full))
  } catch (e) {
    yield put(actions.errorRequestClone(e.message))
  }
}

function* deleteContract({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteContract, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* archiveContract({ payload }) {
  try {
    yield put(actions.beginRequestArchive())
    yield call(service.archiveContract, payload.id, payload.archived)
    yield put(actions.successRequestArchive(payload))
  } catch (e) {
    yield put(actions.errorRequestArchive(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchContracts),
    takeLatest(actions.loadRequest, loadContract),
    takeLatest(actions.createRequest, createContract),
    takeLatest(actions.updateRequest, updateContract),
    takeLatest(actions.cloneRequest, cloneContract),
    takeLatest(actions.deleteRequest, deleteContract),
    takeLatest(actions.archiveRequest, archiveContract),
  ])
}
