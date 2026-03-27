import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/transactionActions'
import * as service from '../../services/providers/firebase/CashFlow/transactions'

function* fetchTransactions({ payload }) {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getTransactions, payload?.year ?? new Date().getFullYear())
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createTransaction({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addTransaction, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateTransaction({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateTransaction, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteTransaction({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteTransaction, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchTransactions),
    takeLatest(actions.createRequest, createTransaction),
    takeLatest(actions.updateRequest, updateTransaction),
    takeLatest(actions.deleteRequest, deleteTransaction),
  ])
}
