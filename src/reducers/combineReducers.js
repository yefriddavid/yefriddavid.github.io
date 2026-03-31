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
import contratoNote from './Contratos/contractNoteReducer'
import contratoAttachment from './Contratos/contractAttachmentReducer'
import egg from './CashFlow/eggReducer'
import transaction from './CashFlow/transactionReducer'
import accountsMaster from './CashFlow/accountsMasterReducer'
import salaryDistribution from './CashFlow/salaryDistributionReducer'
import accountStatusNote from './CashFlow/accountStatusNoteReducer'

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
  contratoNote,
  contratoAttachment,
  egg,
  transaction,
  accountsMaster,
  salaryDistribution,
  accountStatusNote,
})

export default combinedReducers
