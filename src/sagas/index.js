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
import sagaTransactions from './CashFlow/transactionSagas'

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
    sagaTransactions(),
  ])
}
