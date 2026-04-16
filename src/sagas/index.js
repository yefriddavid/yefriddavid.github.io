import { all } from 'redux-saga/effects'
import sagaAccounts from './cashflow/accountSagas'
import sagaPayments from './cashflow/paymentSagas'
import sagaPaymentVauchers from './cashflow/paymentVaucherSagas'
import sagaTaxiExpenses from './taxi/taxiExpenseSagas'
import sagaTaxiDrivers from './taxi/taxiDriverSagas'
import sagaTaxiVehicles from './taxi/taxiVehicleSagas'
import sagaTaxiSettlements from './taxi/taxiSettlementSagas'
import sagaTaxiPartners from './taxi/taxiPartnerSagas'
import sagaTaxiDistributions from './taxi/taxiDistributionSagas'
import sagaTaxiAuditNotes from './taxi/taxiAuditNoteSagas'
import sagaTaxiPeriodNotes from './taxi/taxiPeriodNoteSagas'
import sagaProfile from './profileSagas'
import sagaUsers from './usersSagas'
import sagaContratoProperties from './contratos/propertySagas'
import sagaContratoBankAccounts from './contratos/bankAccountSagas'
import sagaContratoOwners from './contratos/ownerSagas'
import sagaContratos from './contratos/contractSagas'
import sagaContratoNotes from './contratos/contractNoteSagas'
import sagaContratoAttachments from './contratos/contractAttachmentSagas'
import sagaEggs from './cashflow/eggSagas'
import sagaTransactions from './cashflow/transactionSagas'
import sagaAccountsMaster from './cashflow/accountsMasterSagas'
import sagaSalaryDistribution from './cashflow/salaryDistributionSagas'
import sagaAccountStatusNotes from './cashflow/accountStatusNoteSagas'
import sagaMyProjects from './cashflow/myProjectSagas'
import sagaAssets from './cashflow/assetSagas'

export default function* rootSagas() {
  yield all([
    sagaPayments(),
    sagaAccounts(),
    sagaPaymentVauchers(),
    sagaTaxiExpenses(),
    sagaTaxiDrivers(),
    sagaTaxiVehicles(),
    sagaTaxiSettlements(),
    sagaTaxiPartners(),
    sagaTaxiDistributions(),
    sagaTaxiAuditNotes(),
    sagaTaxiPeriodNotes(),
    sagaProfile(),
    sagaUsers(),
    sagaContratoProperties(),
    sagaContratoBankAccounts(),
    sagaContratoOwners(),
    sagaContratos(),
    sagaContratoNotes(),
    sagaContratoAttachments(),
    sagaEggs(),
    sagaTransactions(),
    sagaAccountsMaster(),
    sagaSalaryDistribution(),
    sagaAccountStatusNotes(),
    sagaMyProjects(),
    sagaAssets(),
  ])
}
