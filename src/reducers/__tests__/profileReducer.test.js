import { describe, it, expect } from 'vitest'
import reducer from '../profileReducer'
import * as actions from '../../actions/authActions'
import { makeUser } from '../../__tests__/factories'

const initial = { data: null, loading: false, error: null }

describe('profileReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch profile (triggered after login) ─────────────────────────────────
  describe('fetchProfile', () => {
    it('fetchProfile sets loading and clears error', () => {
      const s = reducer({ ...initial, error: 'old error' }, actions.fetchProfile('jperez'))
      expect(s.loading).toBe(true)
      expect(s.error).toBeNull()
    })

    it('fetchProfileSuccess stores profile data and clears loading', () => {
      const profile = makeUser()
      const s = reducer({ ...initial, loading: true }, actions.fetchProfileSuccess(profile))
      expect(s.data).toEqual(profile)
      expect(s.loading).toBe(false)
    })

    it('fetchProfileError stores error and clears loading', () => {
      const s = reducer({ ...initial, loading: true }, actions.fetchProfileError('not found'))
      expect(s.error).toBe('not found')
      expect(s.loading).toBe(false)
    })
  })

  // ── Update profile ────────────────────────────────────────────────────────
  describe('updateProfile', () => {
    it('updateProfileSuccess merges payload into existing data', () => {
      const profile = makeUser({ name: 'Juan Perez', role: 'manager' })
      const s = reducer(
        { ...initial, data: profile },
        actions.updateProfileSuccess({ name: 'Juan P. Updated', role: 'conductor' }),
      )
      expect(s.data.name).toBe('Juan P. Updated')
      expect(s.data.role).toBe('conductor')
      // Unchanged fields preserved
      expect(s.data.username).toBe(profile.username)
      expect(s.data.email).toBe(profile.email)
    })

    it('updateProfileSuccess is a no-op when data is null', () => {
      const s = reducer(initial, actions.updateProfileSuccess({ name: 'X' }))
      expect(s.data).toBeNull()
    })

    it('updateProfileError stores error', () => {
      const s = reducer(initial, actions.updateProfileError('write denied'))
      expect(s.error).toBe('write denied')
    })
  })

  // ── Update avatar ─────────────────────────────────────────────────────────
  describe('updateAvatar', () => {
    it('updateAvatarSuccess updates avatar field', () => {
      const profile = makeUser({ avatar: null })
      const s = reducer(
        { ...initial, data: profile },
        actions.updateAvatarSuccess('https://storage/avatar.jpg'),
      )
      expect(s.data.avatar).toBe('https://storage/avatar.jpg')
      // Other fields untouched
      expect(s.data.username).toBe(profile.username)
    })

    it('updateAvatarSuccess is a no-op when data is null', () => {
      const s = reducer(initial, actions.updateAvatarSuccess('https://storage/avatar.jpg'))
      expect(s.data).toBeNull()
    })

    it('updateAvatarError stores error', () => {
      const s = reducer(initial, actions.updateAvatarError('upload failed'))
      expect(s.error).toBe('upload failed')
    })
  })

  // ── Logout ────────────────────────────────────────────────────────────────
  describe('clearProfile', () => {
    it('clears data and error', () => {
      const s = reducer(
        { data: makeUser(), loading: false, error: 'some error' },
        actions.clearProfile(),
      )
      expect(s.data).toBeNull()
      expect(s.error).toBeNull()
    })
  })
})
