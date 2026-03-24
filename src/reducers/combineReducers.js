import { combineReducers } from 'redux'
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
import taxiAuditNote from './taxiAuditNoteReducer'
import profile from './profileReducer'
import users from './usersReducer'

const combinedReducers = combineReducers({
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
  taxiAuditNote,
  profile,
  users,
})

export default combinedReducers
