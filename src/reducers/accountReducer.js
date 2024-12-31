// import { fetchData, beginRequest, successRequest, errorRequest } from '../actions/accountActions'
import * as accountActions from '../actions/accountActions'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux'

const initial = {
  error: null,
  fetching: false,
  data: null,
  isError: false,
  selectedAccount: null
}

const state = createReducer({
  [accountActions.fetchData]: (state, payload) => {
    //console.log(payload)
    return {
      ...state,
      filters: payload
    }
  },
  [accountActions.errorRequest]: (state, payload) => {
    return {
      ...state,
      error: payload,
      fetching: false,
      isError: true
    }
  },
  [accountActions.beginRequest]: (state, payload) => {
    return {
      ...state,
      fetching: true
    }
  },
  [accountActions.selectAccount]: (state, payload) => {
    return {
      ...state,
      selectedAccount: payload
    }
  },
  [accountActions.appendVaucherToPayment]: (state, payload) => {

    //console.log(payload);
    return {
      ...state,
      selectedAccountPrueba: payload
    }

  },
  [accountActions.successRequest]: (state, payload) => {
    return {
      ...state,
      data: payload,
      fetching: false
    }
  }
}, initial)

export default combineReducers({
  state
})
