import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiSettlementActions'
import * as service from '../../services/facade/taxi/taxiSettlementFacade'
import { monthToRange } from '../../utils/dateRange'
import { triggerHook } from '../../reducers/system/programHookSlice'

export function* fetchSettlements(action) {
  try {
    yield put(actions.beginRequestFetch())
    const now = new Date()
    const period = action?.payload ?? { month: now.getMonth() + 1, year: now.getFullYear() }
    const filter = period?.month && period?.year ? monthToRange(period) : period
    const data = yield call(service.getSettlements, filter)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createSettlement({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addSettlement, payload)
    yield put(
      actions.successRequestCreate({
        id,
        driver: payload.driver,
        plate: payload.plate?.toUpperCase(),
        amount: Number(payload.amount),
        date: payload.date,
        comment: payload.comment || null,
      }),
    )
    yield put(
      triggerHook({
        tag: 'settlement.create',
        context: { id, driver: payload.driver, plate: payload.plate },
      }),
    )
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

export function* updateSettlement({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateSettlement, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(triggerHook({ tag: 'settlement.update', context: { id: payload.id } }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

export function* deleteSettlement({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteSettlement, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(triggerHook({ tag: 'settlement.delete', context: { id: payload.id } }))
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
