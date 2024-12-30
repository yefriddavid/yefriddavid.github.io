import { combineReducers } from 'redux'
import login from './loginReducer'

const combinedReducers = combineReducers({
    login
})

export default combinedReducers

