import { combineReducers } from 'redux'
import login from './loginReducer'
import payment from './paymentReducer'
import paymentVaucher from './paymentVaucherReducer'
import account from './accountReducer'
import ui from './uiReducer'
import taxiExpense from './taxiExpenseReducer'

const combinedReducers = combineReducers({
  login,
  payment,
  paymentVaucher,
  account,
  ui,
  taxiExpense,
})

export default combinedReducers
