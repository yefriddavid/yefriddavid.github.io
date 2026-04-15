import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/authActions'
import { getUser, updateOwnProfile, updateUserAvatar } from '../../services/providers/firebase/Security/users'
import { fetchProfile, updateProfile, updateAvatar } from '../profileSagas'
import { makeUser } from '../../__tests__/factories'

describe('profileSagas', () => {
  describe('fetchProfile (post-login)', () => {
    it('getUser(username) → fetchProfileSuccess', () => {
      const profile = makeUser()
      const gen = fetchProfile({ payload: 'jperez' })

      expect(gen.next().value).toEqual(call(getUser, 'jperez'))
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
    it('updateOwnProfile(username, payload) → updateProfileSuccess', () => {
      const payload = makeUser({ role: 'conductor' })
      const gen = updateProfile({ payload })

      expect(gen.next().value).toEqual(call(updateOwnProfile, payload.username, payload))
      expect(gen.next().value).toEqual(put(actions.updateProfileSuccess(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches updateProfileError on service failure', () => {
      const gen = updateProfile({ payload: makeUser() })
      gen.next()  // call updateOwnProfile
      expect(gen.throw(new Error('write denied')).value).toEqual(put(actions.updateProfileError('write denied')))
    })
  })

  describe('updateAvatar', () => {
    it('updateUserAvatar(username, avatar) → updateAvatarSuccess(avatar)', () => {
      const payload = { username: 'jperez', avatar: 'https://storage/avatar.jpg' }
      const gen = updateAvatar({ payload })

      expect(gen.next().value).toEqual(call(updateUserAvatar, payload.username, payload.avatar))
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
