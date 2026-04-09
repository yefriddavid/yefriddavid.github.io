import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiDistributionActions'
import * as service from '../../services/providers/firebase/Taxi/taxiDistributions'

function* fetchDistributions() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getDistributions)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createDistribution({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.createDistribution, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updatePartnerPayment({ payload }) {
  try {
    yield put(actions.beginRequestUpdatePayment())
    const paymentData = {
      partnerName: payload.partnerName,
      percentage: payload.percentage,
      calculatedAmount: payload.calculatedAmount,
      paidAmount: Number(payload.paidAmount),
      paidDate: payload.paidDate,
      paid: true,
    }
    yield call(service.updatePartnerPayment, payload.distributionId, payload.partnerId, paymentData)
    yield put(actions.successRequestUpdatePayment(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdatePayment(e.message))
  }
}

function* deleteDistribution({ payload }) {
  try {
    yield call(service.deleteDistribution, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDistributions),
    takeLatest(actions.createRequest, createDistribution),
    takeLatest(actions.updatePaymentRequest, updatePartnerPayment),
    takeLatest(actions.deleteRequest, deleteDistribution),
  ])
}
