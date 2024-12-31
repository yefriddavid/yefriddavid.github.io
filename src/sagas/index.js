import { put, call, take, fork, all } from 'redux-saga/effects'
import sagaAccounts from './accountSagas'
import sagaPayments from './paymentSagas'
import sagaPaymentVauchers from './paymentVaucherSagas'

export default function* rootSagas() {
  yield all([
    // sagaPaymentVauchers(),
    sagaPayments(),
    sagaAccounts(),
    sagaPaymentVauchers(),
  ])
}
