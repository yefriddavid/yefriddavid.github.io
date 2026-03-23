import { combineReducers } from 'redux'
import login from './loginReducer'
import payment from './paymentReducer'
import paymentVaucher from './paymentVaucherReducer'
import account from './accountReducer'
import ui from './uiReducer'
import taxiExpense from './taxiExpenseReducer'
import taxiDriver from './taxiDriverReducer'
import taxiVehicle from './taxiVehicleReducer'
import taxiSettlement from './taxiSettlementReducer'
import taxiPartner from './taxiPartnerReducer'
import taxiDistribution from './taxiDistributionReducer'

const combinedReducers = combineReducers({
  login,
  payment,
  paymentVaucher,
  account,
  ui,
  taxiExpense,
  taxiDriver,
  taxiVehicle,
  taxiSettlement,
  taxiPartner,
  taxiDistribution,
})

export default combinedReducers
