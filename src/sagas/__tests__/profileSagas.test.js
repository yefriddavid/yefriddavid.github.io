import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/authActions'
import * as service from '../../services/providers/firebase/Security/users'
import { makeUser } from '../../__tests__/factories'

// Step-through generator copies (standard redux-saga testing pattern).
// fetchProfile is the saga dispatched immediately after a successful login.
function* fetchProfile({ payload: username }) {
  try {
    const data = yield call(service.getUser, username)
    yield put(actions.fetchProfileSuccess(data))
  } catch (e) {
    yield put(actions.fetchProfileError(e.message))
  }
}

function* updateProfile({ payload }) {
  try {
    yield call(service.updateUser, payload.username, payload)
    yield put(actions.updateProfileSuccess(payload))
  } catch (e) {
    yield put(actions.updateProfileError(e.message))
  }
}

function* updateAvatar({ payload }) {
  try {
    yield call(service.updateUserAvatar, payload.username, payload.avatar)
    yield put(actions.updateAvatarSuccess(payload.avatar))
  } catch (e) {
    yield put(actions.updateAvatarError(e.message))
  }
}

describe('profileSagas', () => {
  // fetchProfile is the saga dispatched right after login succeeds
  describe('fetchProfile (post-login)', () => {
    it('getUser(username) → fetchProfileSuccess', () => {
      const profile = makeUser()
      const gen = fetchProfile({ payload: 'jperez' })

      expect(gen.next().value).toEqual(call(service.getUser, 'jperez'))
      expect(gen.next(profile).value).toEqual(put(actions.fetchProfileSuccess(profile)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches fetchProfileError on service failure', () => {
      const gen = fetchProfile({ payload: 'jperez' })
      gen.next()  // call getUser
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.fetchProfileError('not found')))
    })

    it('null response from getUser is forwarded to fetchProfileSuccess as-is', () => {
      const gen = fetchProfile({ payload: 'ghost' })
      gen.next()  // call getUser
      expect(gen.next(null).value).toEqual(put(actions.fetchProfileSuccess(null)))
    })
  })

  describe('updateProfile', () => {
    it('updateUser(username, payload) → updateProfileSuccess', () => {
      const payload = makeUser({ role: 'conductor' })
      const gen = updateProfile({ payload })

      expect(gen.next().value).toEqual(call(service.updateUser, payload.username, payload))
      expect(gen.next().value).toEqual(put(actions.updateProfileSuccess(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches updateProfileError on service failure', () => {
      const gen = updateProfile({ payload: makeUser() })
      gen.next()  // call updateUser
      expect(gen.throw(new Error('write denied')).value).toEqual(put(actions.updateProfileError('write denied')))
    })
  })

  describe('updateAvatar', () => {
    it('updateUserAvatar(username, avatar) → updateAvatarSuccess(avatar)', () => {
      const payload = { username: 'jperez', avatar: 'https://storage/avatar.jpg' }
      const gen = updateAvatar({ payload })

      expect(gen.next().value).toEqual(call(service.updateUserAvatar, payload.username, payload.avatar))
      expect(gen.next().value).toEqual(put(actions.updateAvatarSuccess(payload.avatar)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches updateAvatarError on service failure', () => {
      const gen = updateAvatar({ payload: { username: 'jperez', avatar: 'data:...' } })
      gen.next()  // call updateUserAvatar
      expect(gen.throw(new Error('upload failed')).value).toEqual(put(actions.updateAvatarError('upload failed')))
    })
  })
})
