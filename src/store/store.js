import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from '@redux-saga/core'
import combinedReducers from '../reducers/combineReducers'
import rootSagas from '../sagas'

const CashFlowMiddleware = (store) => (next) => (action) => next(action)

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: combinedReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware).concat(CashFlowMiddleware),
})

sagaMiddleware.run(rootSagas)

export default store
