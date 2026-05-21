import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../src/actions/cashflow/accountsMasterActions'
import { getAccountsMaster } from '../../src/services/firebase/cashflow/accountsMaster'

function* fetchAccountsMaster() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(getAccountsMaster)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export default function* rootSaga() {
  yield all([takeLatest(actions.fetchRequest, fetchAccountsMaster)])
}
