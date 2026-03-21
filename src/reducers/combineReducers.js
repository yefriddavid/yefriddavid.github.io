import { combineReducers } from 'redux'
import login from './loginReducer'
import payment from './paymentReducer'
import paymentVaucher from './paymentVaucherReducer'
import account from './accountReducer'
import ui from './uiReducer'

const combinedReducers = combineReducers({
  login,
  payment,
  paymentVaucher,
  account,
  ui,
})

export default combinedReducers
