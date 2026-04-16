import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as accountActions from '../../actions/cashflow/accountActions'
import * as apiService from '../../services/api/accounts'

export function* fetchAccounts({ payload: filters }) {
  try {
    yield put(accountActions.beginRequest())
    const response = yield call(apiService.fetchAccounts, filters)

    if (response.status === 'error') {
      yield put(accountActions.errorRequest(response.message))
    } else {
      yield put(accountActions.successRequest(response))
    }
  } catch (e) {
    yield put(accountActions.errorRequest(e.message))
  }
}

export default function* rootSagas() {
  yield all([takeLatest(accountActions.fetchData, fetchAccounts)])
}
