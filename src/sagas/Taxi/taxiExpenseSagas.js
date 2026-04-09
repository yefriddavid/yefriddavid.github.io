import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as taxiExpenseActions from '../../actions/Taxi/taxiExpenseActions'
import * as expenseService from '../../services/providers/firebase/Taxi/taxiExpenses'
import { toggleExpensePaid } from '../../services/providers/firebase/Taxi/taxiExpenses'

function* fetchExpenses() {
  try {
    yield put(taxiExpenseActions.beginRequestFetch())
    const data = yield call(expenseService.fetchExpenses)
    yield put(taxiExpenseActions.successRequestFetch(data))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestFetch(e.message))
  }
}

function* createExpense({ payload }) {
  try {
    yield put(taxiExpenseActions.beginRequestCreate())
    const id = yield call(expenseService.createExpense, payload)
    yield put(taxiExpenseActions.successRequestCreate({ id, ...payload, amount: Number(payload.amount) }))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestCreate(e.message))
  }
}

function* deleteExpense({ payload }) {
  try {
    yield put(taxiExpenseActions.beginRequestDelete())
    yield call(expenseService.deleteExpense, payload.id)
    yield put(taxiExpenseActions.successRequestDelete(payload))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestDelete(e.message))
  }
}

function* togglePaid({ payload }) {
  try {
    yield call(toggleExpensePaid, payload.id, payload.paid)
    yield put(taxiExpenseActions.successRequestTogglePaid(payload))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestTogglePaid(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(taxiExpenseActions.fetchRequest, fetchExpenses),
    takeLatest(taxiExpenseActions.createRequest, createExpense),
    takeLatest(taxiExpenseActions.deleteRequest, deleteExpense),
    takeLatest(taxiExpenseActions.togglePaidRequest, togglePaid),
  ])
}
