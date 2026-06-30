import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as taxiExpenseActions from '../../actions/taxi/taxiExpenseActions'
import * as expenseService from '../../services/facade/taxi/taxiExpenseFacade'
import { monthToRange } from '../../utils/dateRange'
import { push as notify } from '../../reducers/notificationsSlice'
import { triggerHook } from '../../reducers/system/programHookSlice'

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
    yield put(
      taxiExpenseActions.successRequestCreate({ id, ...payload, amount: Number(payload.amount) }),
    )
    yield put(notify({ type: 'success', message: 'Gasto creado correctamente.' }))
    yield put(triggerHook({ tag: 'expense.create', context: { id, category: payload.category } }))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al crear el gasto: ${e.message}` }))
  }
}

export function* deleteExpense({ payload }) {
  try {
    yield put(taxiExpenseActions.beginRequestDelete())
    yield call(expenseService.deleteExpense, payload.id)
    yield put(taxiExpenseActions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Gasto eliminado.' }))
    yield put(triggerHook({ tag: 'expense.delete', context: { id: payload.id } }))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export function* updateExpense({ payload }) {
  try {
    yield put(taxiExpenseActions.beginRequestUpdate())
    yield call(expenseService.updateExpense, payload.id, payload)
    yield put(taxiExpenseActions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Gasto actualizado correctamente.' }))
    yield put(triggerHook({ tag: 'expense.update', context: { id: payload.id } }))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar el gasto: ${e.message}` }))
  }
}

export function* togglePaid({ payload }) {
  try {
    const payedAt = payload.paid ? new Date().toISOString().split('T')[0] : null
    yield call(expenseService.toggleExpensePaid, payload.id, payload.paid, payedAt)
    yield put(taxiExpenseActions.successRequestTogglePaid({ ...payload, payedAt }))
  } catch (e) {
    yield put(taxiExpenseActions.errorRequestTogglePaid(e.message))
    yield put(notify({ type: 'error', message: `Error al actualizar el estado: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(taxiExpenseActions.fetchRequest, fetchExpenses),
    takeLatest(taxiExpenseActions.createRequest, createExpense),
    takeLatest(taxiExpenseActions.updateRequest, updateExpense),
    takeLatest(taxiExpenseActions.deleteRequest, deleteExpense),
    takeLatest(taxiExpenseActions.togglePaidRequest, togglePaid),
  ])
}
