import { all } from 'redux-saga/effects'
import sagaAccounts from './accountSagas'
import sagaPayments from './paymentSagas'
import sagaPaymentVauchers from './paymentVaucherSagas'
import sagaTaxiExpenses from './taxiExpenseSagas'
import sagaTaxiDrivers from './taxiDriverSagas'
import sagaTaxiVehicles from './taxiVehicleSagas'
import sagaTaxiSettlements from './taxiSettlementSagas'

export default function* rootSagas() {
  yield all([
    sagaPayments(),
    sagaAccounts(),
    sagaPaymentVauchers(),
    sagaTaxiExpenses(),
    sagaTaxiDrivers(),
    sagaTaxiVehicles(),
    sagaTaxiSettlements(),
  ])
}
