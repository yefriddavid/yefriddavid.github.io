import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiPartnerActions'
import * as service from '../../services/providers/firebase/Taxi/taxiPartners'

export function* fetchPartners() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPartners)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createPartner({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addPartner, payload)
    yield put(actions.successRequestCreate({ id, name: payload.name, percentage: Number(payload.percentage) }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

export function* updatePartner({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updatePartner, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

export function* deletePartner({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deletePartner, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchPartners),
    takeLatest(actions.createRequest, createPartner),
    takeLatest(actions.updateRequest, updatePartner),
    takeLatest(actions.deleteRequest, deletePartner),
  ])
}
