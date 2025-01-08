// import { fetchData, beginRequest, successRequest, errorRequest } from '../actions/accountActions'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux'
import * as paymentActions from '../actions/paymentActions'
import * as accountActions from '../actions/accountActions'

import cloneDeep from 'lodash/cloneDeep';

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
      data: null,
      filters: payload
    }
  },
  [accountActions.errorRequest]: (state, payload) => {
    return {
      ...state,
      error: payload,
      data: [],
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
  [accountActions.selectVaucher]: (state, payload) => {
    return {
      ...state,
      selectedVaucher: payload
      //selectedAccount: payload
    }
  },
  [accountActions.selectAccount]: (state, payload) => {
    return {
      ...state,
      selectedAccount: payload
    }
  },
  /*[accountActions.loadVauchersToAccountPayment]: (state, payload) => {

    //console.log("OappendVaucher");

    const { data: data2 } = state?.data
    let data = cloneDeep(data2)
    const { items } = data

    if(items){

      const accountIndex = items.findIndex( e => e.accountId = payload.accountId )

      data.items[accountIndex] = { ...payload, vaucherLoaded: true }

      data = { data }
      //console.log(data);
      return {
        ...state,
        //davidRios: true
        data
      }

    }

    },*/
  [accountActions.appendVauchersToAccount]: (state, payload) => {

    //console.log("OappendVaucher");

    const { data: data2 } = state?.data
    let data = cloneDeep(data2)
    const { items } = data

    if(items){

      const accountIndex = items.findIndex( e => e.accountId == payload.accountId )
      // let payment = items.find( e => e.accountId == payload.accountId )
      // const accountIndex = items.find( e => e.accountId = payload.accountId )

      //alert(accountIndex)
      //console.log("accountIndex");
      //console.log(accountIndex);
      //console.log(items);
      //console.log(payment);
      //console.log(payload.accountId);
      //payment = { ...payload, vaucherLoaded: true }

      items[accountIndex] = { ...payload, vaucherLoaded: true }

      data = { data }
      //console.log(data);
      return {
        ...state,
        //davidRios: true
        data
      }

    }
    return {
      ...state,
      data
      //selectedAccountPrueba: payload
    }

  },
  [accountActions.successRequest]: (state, payload) => {
    return {
      ...state,
      data: payload,
      fetching: false
    }
  },
    [paymentActions.successRequestCreate]: (state, payload) => {

      // si se crea un payment asociado a la cuenta seleccionada actualmente, entonces limpiamos la variable
      return {
            ...state,
        selectedAccount: null
        }
    },
}, initial)

export default combineReducers({
  state
})
