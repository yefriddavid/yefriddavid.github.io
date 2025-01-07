import { put, call, take, fork, all, takeLatest } from 'redux-saga/effects'
//import { root } from 'postcss';
import * as accountActions from '../actions/accountActions'
import * as apiService from '../services/providers/api/accounts'

function* fetchAccounts({ payload: filters }) {
  //while(true){
  try{

  // const { payload: filters } = yield take(accountActions.fetchData)

  // yield call(apiServices.fetchAccounts, filters)
      yield put(accountActions.beginRequest())
      const responseApiLogin = yield call(apiService.fetchAccounts, filters)
      yield put(accountActions.successRequest(responseApiLogin))
      //yield fork(logoutFlow)

      //yield fork(watchStartBackgroundApiTasks, request)
    } catch (e) {

      yield put(accountActions.errorRequest(e.toString()))

    }
  //}
}

export default function* rootSagas() {

  yield all([
    // fork(fetchAccounts)
    takeLatest([accountActions.fetchData], fetchAccounts)
  ])
}
