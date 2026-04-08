import { combineReducers } from 'redux'
import payment from './CashFlow/paymentReducer'
import paymentVaucher from './CashFlow/paymentVaucherReducer'
import account from './CashFlow/accountReducer'
import ui from './uiReducer'
import taxiExpense from './Taxi/taxiExpenseReducer'
import taxiDriver from './Taxi/taxiDriverReducer'
import taxiVehicle from './Taxi/taxiVehicleReducer'
import taxiSettlement from './Taxi/taxiSettlementReducer'
import taxiPartner from './Taxi/taxiPartnerReducer'
import taxiDistribution from './Taxi/taxiDistributionReducer'
import taxiAuditNote from './Taxi/taxiAuditNoteReducer'
import taxiPeriodNote from './Taxi/taxiPeriodNoteReducer'
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
import myProject from './CashFlow/myProjectReducer'
import asset from './CashFlow/assetReducer'

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
  myProject,
  asset,
})

export default combinedReducers
