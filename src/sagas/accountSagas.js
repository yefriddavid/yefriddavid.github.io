import { put, call, take, fork, all, takeLatest } from 'redux-saga/effects'
//import { root } from 'postcss';
import * as accountActions from '../actions/accountActions'
import * as apiService from '../services/providers/api/accounts'

function* fetchAccounts({ payload: filters }) {

  try{

      yield put(accountActions.beginRequest())
      const response = yield call(apiService.fetchAccounts, filters)
    //console.log(response);
    if(response.status == "error"){
      yield put(accountActions.errorRequest(response.message))

    }
    else{
      yield put(accountActions.successRequest(response))

    }

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
