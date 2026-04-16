import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/contratos/bankAccountActions'
import * as service from '../../services/firebase/contratos/bankAccounts'

function* fetchBankAccounts() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getBankAccounts)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createBankAccount({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addBankAccount, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateBankAccount({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateBankAccount, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteBankAccount({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteBankAccount, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchBankAccounts),
    takeLatest(actions.createRequest, createBankAccount),
    takeLatest(actions.updateRequest, updateBankAccount),
    takeLatest(actions.deleteRequest, deleteBankAccount),
  ])
}
