import { fetchRequest, beginRequestFetch, createRequest, errorRequestCreate } from '../actions/paymentActions'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux'

const initial = {
  data: null,
    error: {},
    fetching: false,
    isError: false
}

const state = createReducer({
    [fetchRequest]: (state, payload) => {
        console.log(payload)
        return {
            ...state,
            filters: payload
            // username: payload.username,
            // password: payload.password
        }
    },
  [errorRequestCreate]: (state, payload) => {
        return {
            ...state,
            error: payload,
          data: [],
            fetching: false,
            isError: true
        }
  },
    [createRequest]: (state, payload) => {
        return {
            ...state,
            fetching: true
        }
    },
    [beginRequestFetch]: (state, payload) => {
        return {
            ...state,
            fetching: true
        }
    },
  /*[successRequest]: (state, payload) => {
        return {
            ...state,
            fetching: false
        }
    }*/
}, initial)

export default combineReducers({
    state
})
