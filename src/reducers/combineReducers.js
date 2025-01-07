import { combineReducers } from 'redux'
import login from './loginReducer'
import payment from './paymentReducer'
import paymentVaucher from './paymentVaucherReducer'
import account from './accountReducer'

const combinedReducers = combineReducers({
  login,
  payment,
  paymentVaucher,
  account,
})

export default combinedReducers

