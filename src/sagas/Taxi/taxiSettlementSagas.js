import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiSettlementActions'
import * as service from '../../services/providers/firebase/CashFlow/taxiSettlements'

function* fetchSettlements() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getSettlements)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createSettlement({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addSettlement, payload)
    yield put(actions.successRequestCreate({
      id,
      driver: payload.driver,
      plate: payload.plate?.toUpperCase(),
      amount: Number(payload.amount),
      date: payload.date,
      comment: payload.comment || null,
    }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateSettlement({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateSettlement, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteSettlement({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteSettlement, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchSettlements),
    takeLatest(actions.createRequest, createSettlement),
    takeLatest(actions.updateRequest, updateSettlement),
    takeLatest(actions.deleteRequest, deleteSettlement),
  ])
}
