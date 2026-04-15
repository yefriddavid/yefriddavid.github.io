import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as eggActions from '../../actions/CashFlow/eggActions'
import * as eggService from '../../services/providers/firebase/CashFlow/eggs'

function* fetchEggs() {
  try {
    yield put(eggActions.beginRequestFetch())
    const data = yield call(eggService.fetchEggs)
    yield put(eggActions.successRequestFetch(data))
  } catch (e) {
    yield put(eggActions.errorRequestFetch(e.message))
  }
}

function* createEgg({ payload }) {
  try {
    yield put(eggActions.beginRequestCreate())
    const id = yield call(eggService.createEgg, payload)
    yield put(
      eggActions.successRequestCreate({
        id,
        ...payload,
        quantity: Number(payload.quantity),
        price: Number(payload.price),
      }),
    )
  } catch (e) {
    yield put(eggActions.errorRequestCreate(e.message))
  }
}

function* updateEgg({ payload }) {
  try {
    yield put(eggActions.beginRequestUpdate())
    yield call(eggService.updateEgg, payload.id, payload)
    yield put(eggActions.successRequestUpdate(payload))
  } catch (e) {
    yield put(eggActions.errorRequestUpdate(e.message))
  }
}

function* deleteEgg({ payload }) {
  try {
    yield put(eggActions.beginRequestDelete())
    yield call(eggService.deleteEgg, payload.id)
    yield put(eggActions.successRequestDelete(payload))
  } catch (e) {
    yield put(eggActions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(eggActions.fetchRequest, fetchEggs),
    takeLatest(eggActions.createRequest, createEgg),
    takeLatest(eggActions.updateRequest, updateEgg),
    takeLatest(eggActions.deleteRequest, deleteEgg),
  ])
}
