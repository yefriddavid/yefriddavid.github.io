import { successRequestCreate } from '../actions/paymentActions'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux'

const initial = {
  data: null,
  error: {},
  fetching: false,
  isError: false
}

const state = createReducer({
  [successRequestCreate]: (state, payload) => {

    return {
      ...state,
      filters: payload
    }
  },
}, initial)

export default combineReducers({
    state
})
