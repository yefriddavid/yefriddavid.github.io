import { login as loginAction, errorRequest, beginLoginRequest, successRequest } from '../actions/authActions'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux'

const initial = {
    error: {},
    fetching: false,
    isError: false
}

const login = createReducer({
    [loginAction]: (state, payload) => {
        console.log(payload)
        return {
            ...state,
            // username: payload.username,
            // password: payload.password
        }
    },
    [errorRequest]: (state, payload) => {
        return {
            ...state,
            error: payload,
            fetching: false,
            isError: true
        }
    },
    [beginLoginRequest]: (state, payload) => {
        return {
            ...state,
            fetching: true
        }
    },
    [successRequest]: (state, payload) => {
        return {
            ...state,
            fetching: false
        }
    }
}, initial)

export default combineReducers({
  login
})
