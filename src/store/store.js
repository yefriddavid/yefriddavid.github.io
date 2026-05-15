import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from '@redux-saga/core'
import { createLogger } from 'redux-logger'
import combinedReducers from '../reducers/combineReducers'
import rootSagas from '../sagas'

const sagaMiddleware = createSagaMiddleware()

const middleware = (getDefaultMiddleware) => {
  const base = getDefaultMiddleware().concat(sagaMiddleware)
  return import.meta.env.DEV ? base.concat(createLogger({ collapsed: true })) : base
}

const store = configureStore({
  reducer: combinedReducers,
  middleware,
})

sagaMiddleware.run(rootSagas)

export default store
