import { all } from 'redux-saga/effects'
import domoticaTransactionSagas from '../../src/sagas/domotica/domoticaTransactionSagas'
import taxiDriverSagas from '../../src/sagas/taxi/taxiDriverSagas'
import taxiVehicleSagas from '../../src/sagas/taxi/taxiVehicleSagas'

export default function* rootSaga() {
  yield all([domoticaTransactionSagas(), taxiDriverSagas(), taxiVehicleSagas()])
}
