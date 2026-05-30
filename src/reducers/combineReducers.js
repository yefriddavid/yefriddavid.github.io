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
import taxiPeriodAttachment from './taxi/taxiPeriodAttachmentReducer'
import taxiDriverDocument from './taxi/taxiDriverDocumentReducer'
import taxiDriverGenDoc from './taxi/taxiDriverGenDocReducer'
import vehicleLocationHistory from './taxi/vehicleLocationHistoryReducer'
import currentPositions from './taxi/currentPositionsReducer'
import vehicleRoute from './taxi/vehicleRouteReducer'
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
import gridTrade from './cashflow/gridTradeReducer'
import customGridTrade from './finance/customGridTradeReducer'
import tenants from './tenantsReducer'
import domoticaTransaction from './domotica/domoticaTransactionReducer'
import domoticaCurrent from './domotica/domoticaCurrentReducer'
import domoticaDevice from './domotica/domoticaDeviceReducer'
import domoticaCommand from './domotica/domoticaCommandReducer'
import domoticaCommandDictionary from './domotica/domoticaCommandDictionaryReducer'
import domoticaCommandProfile from './domotica/domoticaCommandProfileReducer'
import domoticaSolarBattery from './domotica/domoticaSolarBatteryReducer'
import notifications from './notificationsSlice'
import errorLog from './system/errorLogReducer'
import inmobiliariaDesign from './inmobiliaria/designReducer'
import inmobiliariaPlanos from './inmobiliaria/planosReducer'
import financePictures from './finance/picturesReducer'
import financePictureVersions from './finance/pictureVersionsReducer'
import financeScenes3d from './finance/scenes3dReducer'

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
  taxiPeriodAttachment,
  taxiDriverDocument,
  taxiDriverGenDoc,
  vehicleLocationHistory,
  currentPositions,
  vehicleRoute,
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
  gridTrade,
  customGridTrade,
  tenants,
  domoticaTransaction,
  domoticaCurrent,
  domoticaDevice,
  domoticaCommand,
  domoticaCommandDictionary,
  domoticaCommandProfile,
  domoticaSolarBattery,
  notifications,
  errorLog,
  inmobiliariaDesign,
  inmobiliariaPlanos,
  financePictures,
  financePictureVersions,
  financeScenes3d,
})

export default combinedReducers
