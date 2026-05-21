import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import domoticaTransactionReducer from '../../src/reducers/domotica/domoticaTransactionReducer'
import taxiDriverReducer from '../../src/reducers/taxi/taxiDriverReducer'
import taxiVehicleReducer from '../../src/reducers/taxi/taxiVehicleReducer'
import accountsMasterReducer from '../../src/reducers/cashflow/accountsMasterReducer'
import transactionReducer from '../../src/reducers/cashflow/transactionReducer'
import notificationsReducer from '../../src/reducers/notificationsSlice'
import rootSaga from './rootSaga.js'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: {
    domoticaTransaction: domoticaTransactionReducer,
    taxiDriver: taxiDriverReducer,
    taxiVehicle: taxiVehicleReducer,
    accountsMaster: accountsMasterReducer,
    transaction: transactionReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export default store
