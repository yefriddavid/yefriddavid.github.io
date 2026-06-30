import { take, call, put, fork, all } from 'redux-saga/effects'
import { push as notify } from '../../reducers/notificationsSlice'
import { getHookPrograms, runProgram } from '../../utils/programRunner'
import * as usersActions from '../../actions/usersActions'
import * as taxiDriverActions from '../../actions/taxi/taxiDriverActions'
import * as taxiVehicleActions from '../../actions/taxi/taxiVehicleActions'
import * as taxiSettlementActions from '../../actions/taxi/taxiSettlementActions'
import * as taxiExpenseActions from '../../actions/taxi/taxiExpenseActions'
import * as taxiPartnerActions from '../../actions/taxi/taxiPartnerActions'
import * as paymentActions from '../../actions/cashflow/paymentActions'
import * as transactionActions from '../../actions/cashflow/transactionActions'

const HOOK_MAP = [
  { action: usersActions.successRequestCreate, hook: 'user.create' },
  { action: usersActions.successRequestUpdate, hook: 'user.update' },
  { action: usersActions.successRequestDelete, hook: 'user.delete' },
  { action: taxiDriverActions.successRequestCreate, hook: 'driver.create' },
  { action: taxiDriverActions.successRequestUpdate, hook: 'driver.update' },
  { action: taxiDriverActions.successRequestDelete, hook: 'driver.delete' },
  { action: taxiVehicleActions.successRequestCreate, hook: 'vehicle.create' },
  { action: taxiVehicleActions.successRequestUpdate, hook: 'vehicle.update' },
  { action: taxiVehicleActions.successRequestDelete, hook: 'vehicle.delete' },
  { action: taxiSettlementActions.successRequestCreate, hook: 'settlement.create' },
  { action: taxiSettlementActions.successRequestUpdate, hook: 'settlement.update' },
  { action: taxiSettlementActions.successRequestDelete, hook: 'settlement.delete' },
  { action: taxiExpenseActions.successRequestCreate, hook: 'expense.create' },
  { action: taxiExpenseActions.successRequestUpdate, hook: 'expense.update' },
  { action: taxiExpenseActions.successRequestDelete, hook: 'expense.delete' },
  { action: taxiPartnerActions.successRequestCreate, hook: 'partner.create' },
  { action: taxiPartnerActions.successRequestUpdate, hook: 'partner.update' },
  { action: taxiPartnerActions.successRequestDelete, hook: 'partner.delete' },
  { action: paymentActions.successRequestCreate, hook: 'payment.create' },
  { action: paymentActions.successRequestDelete, hook: 'payment.delete' },
  { action: transactionActions.successRequestCreate, hook: 'transaction.create' },
  { action: transactionActions.successRequestUpdate, hook: 'transaction.update' },
  { action: transactionActions.successRequestDelete, hook: 'transaction.delete' },
]

const ACTION_TYPE_TO_HOOK = Object.fromEntries(
  HOOK_MAP.map(({ action, hook }) => [action.type, hook]),
)

const WATCHED_TYPES = HOOK_MAP.map(({ action }) => action.type)

function* executeHook(hookKey) {
  const programs = getHookPrograms(hookKey)
  for (const program of programs) {
    const result = yield call(runProgram, program)
    if (result) {
      yield put(notify({ type: 'hook-output', program: program.name, output: result }))
    }
  }
}

function* watchHooks() {
  while (true) {
    const action = yield take(WATCHED_TYPES)
    const hookKey = ACTION_TYPE_TO_HOOK[action.type]
    if (hookKey) yield fork(executeHook, hookKey)
  }
}

export default function* hookExecutorSaga() {
  yield all([watchHooks()])
}
