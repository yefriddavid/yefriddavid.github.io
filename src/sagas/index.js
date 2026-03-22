import { all } from 'redux-saga/effects'
import sagaAccounts from './accountSagas'
import sagaPayments from './paymentSagas'
import sagaPaymentVauchers from './paymentVaucherSagas'
import sagaTaxiExpenses from './taxiExpenseSagas'

export default function* rootSagas() {
  yield all([
    sagaPayments(),
    sagaAccounts(),
    sagaPaymentVauchers(),
    sagaTaxiExpenses(),
  ])
}
