import { combineReducers } from 'redux'
import payment from './CashFlow/paymentReducer'
import paymentVaucher from './CashFlow/paymentVaucherReducer'
import account from './CashFlow/accountReducer'
import ui from './uiReducer'
import taxiExpense from './CashFlow/taxiExpenseReducer'
import taxiDriver from './CashFlow/taxiDriverReducer'
import taxiVehicle from './CashFlow/taxiVehicleReducer'
import taxiSettlement from './CashFlow/taxiSettlementReducer'
import taxiPartner from './CashFlow/taxiPartnerReducer'
import taxiDistribution from './CashFlow/taxiDistributionReducer'
import taxiAuditNote from './CashFlow/taxiAuditNoteReducer'
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
