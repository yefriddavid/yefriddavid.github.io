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
import taxiPeriodNote from './CashFlow/taxiPeriodNoteReducer'
import profile from './profileReducer'
import users from './usersReducer'
import contratoProperty from './Contratos/propertyReducer'
import contratoBankAccount from './Contratos/bankAccountReducer'
import contratoOwner from './Contratos/ownerReducer'
import contrato from './Contratos/contractReducer'

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
  taxiPeriodNote,
  profile,
  users,
  contratoProperty,
  contratoBankAccount,
  contratoOwner,
  contrato,
})

export default combinedReducers
