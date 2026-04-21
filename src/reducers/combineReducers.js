import { combineReducers } from 'redux'
import payment from './cashflow/paymentReducer'
import paymentVaucher from './cashflow/paymentVaucherReducer'
import account from './cashflow/accountReducer'
import ui from './uiReducer'
import taxiExpense from './taxi/taxiExpenseReducer'
import taxiDriver from './taxi/taxiDriverReducer'
import taxiVehicle from './taxi/taxiVehicleReducer'
import taxiSettlement from './taxi/taxiSettlementReducer'
import taxiPartner from './taxi/taxiPartnerReducer'
import taxiDistribution from './taxi/taxiDistributionReducer'
import taxiAuditNote from './taxi/taxiAuditNoteReducer'
import taxiPeriodNote from './taxi/taxiPeriodNoteReducer'
import vehicleLocationHistory from './taxi/vehicleLocationHistoryReducer'
import profile from './profileReducer'
import users from './usersReducer'
import contratoProperty from './contratos/propertyReducer'
import contratoBankAccount from './contratos/bankAccountReducer'
import contratoOwner from './contratos/ownerReducer'
import contrato from './contratos/contractReducer'
import contratoNote from './contratos/contractNoteReducer'
import contratoAttachment from './contratos/contractAttachmentReducer'
import egg from './cashflow/eggReducer'
import transaction from './cashflow/transactionReducer'
import accountsMaster from './cashflow/accountsMasterReducer'
import salaryDistribution from './cashflow/salaryDistributionReducer'
import accountStatusNote from './cashflow/accountStatusNoteReducer'
import myProject from './cashflow/myProjectReducer'
import asset from './cashflow/assetReducer'
import tenants from './tenantsReducer'

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
  vehicleLocationHistory,
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
  tenants,
})

export default combinedReducers
