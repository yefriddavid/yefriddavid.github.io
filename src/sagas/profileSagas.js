import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../actions/authActions'
import { getUser, updateOwnProfile, updateUserAvatar } from '../services/providers/firebase/Security/users'

function* fetchProfile({ payload: username }) {
  try {
    const data = yield call(getUser, username)
    yield put(actions.fetchProfileSuccess(data))
  } catch (e) {
    yield put(actions.fetchProfileError(e.message))
  }
}

function* updateProfile({ payload }) {
  try {
    yield call(updateOwnProfile, payload.username, payload)
    yield put(actions.updateProfileSuccess(payload))
  } catch (e) {
    yield put(actions.updateProfileError(e.message))
  }
}

function* updateAvatar({ payload }) {
  try {
    yield call(updateUserAvatar, payload.username, payload.avatar)
    yield put(actions.updateAvatarSuccess(payload.avatar))
  } catch (e) {
    yield put(actions.updateAvatarError(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchProfile, fetchProfile),
    takeLatest(actions.updateProfile, updateProfile),
    takeLatest(actions.updateAvatar, updateAvatar),
  ])
}
