import { all } from 'redux-saga/effects'
import sagaAccounts from './cashflow/accountSagas'
import sagaPayments from './cashflow/paymentSagas'
import sagaTaxiExpenses from './taxi/taxiExpenseSagas'
import sagaTaxiDrivers from './taxi/taxiDriverSagas'
import sagaTaxiVehicles from './taxi/taxiVehicleSagas'
import sagaTaxiSettlements from './taxi/taxiSettlementSagas'
import sagaTaxiPartners from './taxi/taxiPartnerSagas'
import sagaTaxiDistributions from './taxi/taxiDistributionSagas'
import sagaTaxiAuditNotes from './taxi/taxiAuditNoteSagas'
import sagaTaxiPeriodNotes from './taxi/taxiPeriodNoteSagas'
import sagaTaxiPeriodAttachments from './taxi/taxiPeriodAttachmentSagas'
import sagaTaxiDriverDocuments from './taxi/taxiDriverDocumentSagas'
import sagaTaxiDriverGenDocs from './taxi/taxiDriverGenDocSagas'
import sagaVehicleLocationHistory from './taxi/vehicleLocationHistorySagas'
import sagaVehicleRoute from './taxi/vehicleRouteSagas'
import sagaCurrentPositions from './taxi/currentPositionsSagas'
import sagaProfile from './profileSagas'
import sagaUsers from './usersSagas'
import sagaContratoProperties from './contratos/propertySagas'
import sagaContratoBankAccounts from './contratos/bankAccountSagas'
import sagaContratoOwners from './contratos/ownerSagas'
import sagaContratos from './contratos/contractSagas'
import sagaContratoNotes from './contratos/contractNoteSagas'
import sagaContratoAttachments from './contratos/contractAttachmentSagas'
import sagaContratoModuleNotes from './contratos/contractModuleNoteSagas'
import sagaEggs from './cashflow/eggSagas'
import sagaTransactions from './cashflow/transactionSagas'
import sagaAccountsMaster from './cashflow/accountsMasterSagas'
import sagaSalaryDistribution from './cashflow/salaryDistributionSagas'
import sagaAccountStatusNotes from './cashflow/accountStatusNoteSagas'
import sagaMyProjects from './cashflow/myProjectSagas'
import sagaAssets from './cashflow/assetSagas'
import sagaGridTrades from './cashflow/gridTradeSagas'
import sagaCustomGridTrades from './finance/customGridTradeSagas'
import sagaCalcList from './finance/calcListSagas'
import sagaTenants from './tenantsSagas'
import sagaDomoticaTransactions from './domotica/domoticaTransactionSagas'
import sagaDomoticaCurrent from './domotica/domoticaCurrentSagas'
import sagaDomoticaDevices from './domotica/domoticaDeviceSagas'
import sagaDomoticaCommands from './domotica/domoticaCommandSagas'
import sagaDomoticaCommandDictionary from './domotica/domoticaCommandDictionarySagas'
import sagaDomoticaCommandProfiles from './domotica/domoticaCommandProfileSagas'
import sagaDomoticaSolarBattery from './domotica/domoticaSolarBatterySagas'
import sagaDomoticaSolarCalc from './domotica/domoticaSolarCalcSagas'
import sagaErrorLogs from './system/errorLogSagas'
import sagaAuditLogs from './system/auditLogSagas'
import sagaPerfLogs from './system/perfLogSagas'
import sagaFcmTokens from './system/fcmTokenSagas'
import sagaPageVisits from './system/pageVisitSagas'
import sagaInmobiliariaDesigns from './inmobiliaria/designSagas'
import sagaInmobiliariaPlanos from './inmobiliaria/planosSagas'
import sagaFinancePictures from './finance/picturesSagas'
import sagaFinancePictureVersions from './finance/pictureVersionsSagas'
import sagaFinanceScenes3d from './finance/scenes3dSagas'
import sagaIncreaseDecrease from './finance/increaseDecreaseSagas'
import sagaLoans from './finance/loanSagas'
import sagaTasks from './misc/taskSagas'
import sagaNotes from './misc/noteSagas'
import sagaTaxiTrend from './taxi/taxiTrendSagas'
import sagaAppSettings from './system/appSettingsSagas'
import sagaUsageMetrics from './system/usageMetricsSagas'
import sagaContactMessages from './system/contactMessageSagas'

export default function* rootSagas() {
  yield all([
    sagaPayments(),
    sagaAccounts(),
    sagaTaxiExpenses(),
    sagaTaxiDrivers(),
    sagaTaxiVehicles(),
    sagaTaxiSettlements(),
    sagaTaxiPartners(),
    sagaTaxiDistributions(),
    sagaTaxiAuditNotes(),
    sagaTaxiPeriodNotes(),
    sagaTaxiPeriodAttachments(),
    sagaTaxiDriverDocuments(),
    sagaTaxiDriverGenDocs(),
    sagaVehicleLocationHistory(),
    sagaVehicleRoute(),
    sagaCurrentPositions(),
    sagaProfile(),
    sagaUsers(),
    sagaContratoProperties(),
    sagaContratoBankAccounts(),
    sagaContratoOwners(),
    sagaContratos(),
    sagaContratoNotes(),
    sagaContratoAttachments(),
    sagaContratoModuleNotes(),
    sagaEggs(),
    sagaTransactions(),
    sagaAccountsMaster(),
    sagaSalaryDistribution(),
    sagaAccountStatusNotes(),
    sagaMyProjects(),
    sagaAssets(),
    sagaGridTrades(),
    sagaCustomGridTrades(),
    sagaCalcList(),
    sagaTenants(),
    sagaDomoticaTransactions(),
    sagaDomoticaCurrent(),
    sagaDomoticaDevices(),
    sagaDomoticaCommands(),
    sagaDomoticaCommandDictionary(),
    sagaDomoticaCommandProfiles(),
    sagaDomoticaSolarBattery(),
    sagaDomoticaSolarCalc(),
    sagaErrorLogs(),
    sagaAuditLogs(),
    sagaPerfLogs(),
    sagaFcmTokens(),
    sagaPageVisits(),
    sagaInmobiliariaDesigns(),
    sagaInmobiliariaPlanos(),
    sagaFinancePictures(),
    sagaFinancePictureVersions(),
    sagaFinanceScenes3d(),
    sagaIncreaseDecrease(),
    sagaLoans(),
    sagaTasks(),
    sagaNotes(),
    sagaTaxiTrend(),
    sagaAppSettings(),
    sagaUsageMetrics(),
    sagaContactMessages(),
  ])
}
