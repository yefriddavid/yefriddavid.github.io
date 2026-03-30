import { put, call, all, takeLatest, select } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/accountsMasterActions'
import * as service from '../../services/providers/firebase/CashFlow/accountsMaster'

function* fetchAccountsMaster() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getAccountsMaster)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createAccountMaster({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addAccountMaster, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateAccountMaster({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateAccountMaster, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteAccountMaster({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteAccountMaster, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* seedAccountsMaster({ payload }) {
  try {
    const items = payload
    for (let i = 0; i < items.length; i++) {
      yield call(service.addAccountMaster, items[i])
      yield put(actions.seedProgressUpdate(Math.round(((i + 1) / items.length) * 100)))
    }
    const data = yield call(service.getAccountsMaster)
    yield put(actions.successRequestFetch(data))
    yield put(actions.seedComplete())
  } catch (e) {
    yield put(actions.seedError(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchAccountsMaster),
    takeLatest(actions.createRequest, createAccountMaster),
    takeLatest(actions.updateRequest, updateAccountMaster),
    takeLatest(actions.deleteRequest, deleteAccountMaster),
    takeLatest(actions.seedRequest, seedAccountsMaster),
  ])
}
