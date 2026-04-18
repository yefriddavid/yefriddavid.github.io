import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../actions/tenantsActions'
import * as service from '../services/firebase/admin/tenants'
import { setUserTenant } from '../services/firebase/security/users'
import { fetchRequest as fetchUsersRequest } from '../actions/usersActions'

function* fetchTenants() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getTenants)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createTenant({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addTenant, payload)
    yield put(actions.successRequestCreate({ ...payload, id }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateTenant({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateTenant, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteTenant({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteTenant, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* assignUser({ payload: { username, tenantId } }) {
  try {
    yield call(setUserTenant, username, tenantId)
    yield put(actions.assignUserSuccess({ username, tenantId }))
    yield put(fetchUsersRequest())
  } catch (e) {
    yield put(actions.assignUserError(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchTenants),
    takeLatest(actions.createRequest, createTenant),
    takeLatest(actions.updateRequest, updateTenant),
    takeLatest(actions.deleteRequest, deleteTenant),
    takeLatest(actions.assignUserRequest, assignUser),
  ])
}
