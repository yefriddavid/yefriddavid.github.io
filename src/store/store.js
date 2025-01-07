import { legacy_createStore as createStore, applyMiddleware } from 'redux'
import { configureStore } from "@reduxjs/toolkit";


//import createSagaMiddleware from 'redux-saga/core'
import createSagaMiddleware from "@redux-saga/core";

import combinedReducers from '../reducers/combineReducers'

import rootSagas from '../sagas'

const CashFlowMiddleware = (store) => (next) => (action) => {

  //alert("  my middleware")
  ///console.log("my middleware");
  ///console.log(action);
  ///console.log(store.getState());

  ///if(false){

  ///}

  return next(action)
}

const sagaMiddleware = createSagaMiddleware()
const store = configureStore({
  reducer: combinedReducers,
  //initialState,
  //window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  //middleware: applyMiddleware(sagaMiddleware)
  // middleware: (getDefaultMiddleware) => applyMiddleware(sagaMiddleware)

 // middleware: getDefaultMiddleware().concat(routerMiddleware(history)),
  //middleware: [sagaMiddleware]
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware).concat(CashFlowMiddleware),

})


sagaMiddleware.run(rootSagas)

export default store
