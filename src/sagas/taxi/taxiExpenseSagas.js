import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as taxiExpenseActions from '../../actions/taxi/taxiExpenseActions'
import * as expenseService from '../../services/facade/taxi/taxiExpenseFacade'
import { monthToRange } from '../../utils/dateRange'

export function* fetchExpenses(action) {
  try {
    yield put(taxiExpenseActions.beginRequestFetch())
    const payload = action?.payload
    const filter = payload?.month && payload?.year ? monthToRange(payload) : payload
    const data = yield call(expenseService.fetchExpenses, filter)
    yield put(taxiExpenseActions.successRequestFetch(data))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestFetch(e.message))
  }
}

export function* createExpense({ payload }) {
  try {
    yield put(taxiExpenseActions.beginRequestCreate())
    const id = yield call(expenseService.createExpense, payload)
    console.log('[taxiExpense] create success, id:', id)
    yield put(
      taxiExpenseActions.successRequestCreate({ id, ...payload, amount: Number(payload.amount) }),
    )
  } catch (e) {
    console.error('[taxiExpense] create error:', e)
    yield put(taxiExpenseActions.errorRequestCreate(e.message))
  }
}

export function* deleteExpense({ payload }) {
  try {
    yield put(taxiExpenseActions.beginRequestDelete())
    yield call(expenseService.deleteExpense, payload.id)
    yield put(taxiExpenseActions.successRequestDelete(payload))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestDelete(e.message))
  }
}

export function* togglePaid({ payload }) {
  try {
    const payedAt = payload.paid ? new Date().toISOString().split('T')[0] : null
    yield call(expenseService.toggleExpensePaid, payload.id, payload.paid, payedAt)
    yield put(taxiExpenseActions.successRequestTogglePaid({ ...payload, payedAt }))
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
