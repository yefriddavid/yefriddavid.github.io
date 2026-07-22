import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/finance/cryptoWithdrawalActions'
import * as service from '../../services/firebase/finance/cryptoWithdrawal'
import { push } from '../../reducers/notificationsSlice'

function* loadWithdrawals() {
  try {
    const withdrawals = yield call(service.fetchAll)
    yield put(actions.loadSuccess(withdrawals))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* sagaCryptoWithdrawals() {
  yield all([takeLatest(actions.loadRequest, loadWithdrawals)])
}
