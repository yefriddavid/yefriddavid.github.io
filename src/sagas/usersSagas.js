import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../actions/usersActions'
import * as service from '../services/facade/security/usersFacade'
import * as sessionService from '../services/facade/security/sessionsFacade'
import { triggerHook } from '../reducers/system/programHookSlice'

export function* fetchUsers() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getAllUsers)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createUser({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    yield call(service.createUser, payload)
    yield put(actions.successRequestCreate(payload))
    yield put(triggerHook({ tag: 'user.create', context: { username: payload.username } }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

export function* updateUser({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateUser, payload.username, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(triggerHook({ tag: 'user.update', context: { username: payload.username } }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

export function* deleteUser({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteUser, payload.username)
    yield put(actions.successRequestDelete(payload))
    yield put(triggerHook({ tag: 'user.delete', context: { username: payload.username } }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* fetchSessions({ payload: username }) {
  try {
    const sessions = yield call(sessionService.getSessionsByUser, username)
    yield put(actions.fetchSessionsSuccess({ username, sessions }))
  } catch (e) {
    yield put(actions.fetchSessionsError({ username, error: e.message }))
  }
}

function* deleteSessionSaga({ payload: { username, sessionId } }) {
  try {
    yield call(sessionService.deleteSession, sessionId)
    yield put(actions.deleteSessionSuccess({ username, sessionId }))
  } catch (e) {
    yield put(actions.deleteSessionError({ username, error: e.message }))
  }
}

function* deleteAllSessionsSaga({ payload: username }) {
  try {
    yield call(sessionService.deleteAllSessionsByUser, username)
    yield put(actions.deleteAllSessionsSuccess({ username }))
  } catch (e) {
    yield put(actions.deleteAllSessionsError({ username, error: e.message }))
  }
}

function* adminResetPasswordSaga({ payload: { username, password } }) {
  try {
    yield call(service.adminSetPassword, username, password)
    yield put(actions.adminResetPasswordSuccess({ username }))
    yield put(triggerHook({ tag: 'user.update', context: { username } }))
  } catch (e) {
    yield put(actions.adminResetPasswordError({ username, error: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchUsers),
    takeLatest(actions.createRequest, createUser),
    takeLatest(actions.updateRequest, updateUser),
    takeLatest(actions.deleteRequest, deleteUser),
    takeLatest(actions.fetchSessionsRequest, fetchSessions),
    takeLatest(actions.deleteSessionRequest, deleteSessionSaga),
    takeLatest(actions.deleteAllSessionsRequest, deleteAllSessionsSaga),
    takeLatest(actions.adminResetPasswordRequest, adminResetPasswordSaga),
  ])
}
