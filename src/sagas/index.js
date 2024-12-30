import { put, call, take, fork } from 'redux-saga/effects'
import { root } from 'postcss';
import * as authActions from '../actions/authActions'
import * as apiService from '../services/providers/api/auth'

function* onActionLogin() {
    while (true) {
        try {
            const { payload } = yield take(authActions.login)
            yield put(authActions.beginLoginRequest())
            const responseApiLogin = yield call(apiService.apiLogin, payload)
            yield put(authActions.successRequest(responseApiLogin))
            console.log(responseApiLogin)
        }
        catch(e) {
            yield put(authActions.errorRequest(e))
            console.log(e)
        }
    }
}

export default function* rootSagas() {
    yield fork(onActionLogin)
    console.log("Este es el sagas")
}