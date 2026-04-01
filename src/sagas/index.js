import { all } from 'redux-saga/effects'
import sagaAccounts from './CashFlow/accountSagas'
import sagaPayments from './CashFlow/paymentSagas'
import sagaPaymentVauchers from './CashFlow/paymentVaucherSagas'
import sagaTaxiExpenses from './CashFlow/taxiExpenseSagas'
import sagaTaxiDrivers from './CashFlow/taxiDriverSagas'
import sagaTaxiVehicles from './CashFlow/taxiVehicleSagas'
import sagaTaxiSettlements from './CashFlow/taxiSettlementSagas'
import sagaTaxiPartners from './CashFlow/taxiPartnerSagas'
import sagaTaxiDistributions from './CashFlow/taxiDistributionSagas'
import sagaTaxiAuditNotes from './CashFlow/taxiAuditNoteSagas'
import sagaTaxiPeriodNotes from './CashFlow/taxiPeriodNoteSagas'
import sagaProfile from './profileSagas'
import sagaUsers from './usersSagas'
import sagaContratoProperties from './Contratos/propertySagas'
import sagaContratoBankAccounts from './Contratos/bankAccountSagas'
import sagaContratoOwners from './Contratos/ownerSagas'
import sagaContratos from './Contratos/contractSagas'
import sagaContratoNotes from './Contratos/contractNoteSagas'
import sagaContratoAttachments from './Contratos/contractAttachmentSagas'
import sagaEggs from './CashFlow/eggSagas'
import sagaTransactions from './CashFlow/transactionSagas'
import sagaAccountsMaster from './CashFlow/accountsMasterSagas'
import sagaSalaryDistribution from './CashFlow/salaryDistributionSagas'
import sagaAccountStatusNotes from './CashFlow/accountStatusNoteSagas'
import sagaMyProjects from './CashFlow/myProjectSagas'
import sagaAssets from './CashFlow/assetSagas'

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
