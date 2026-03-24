import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from '@redux-saga/core'
import combinedReducers from '../reducers/combineReducers'
import rootSagas from '../sagas'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: combinedReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
})

sagaMiddleware.run(rootSagas)

export default store
