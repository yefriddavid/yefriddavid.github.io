import { describe, it, expect } from 'vitest'
import reducer from '../domoticaCommandProfileReducer'
import * as actions from '../../../actions/domotica/domoticaCommandProfileActions'
import { makeDomoticaProfile, makeDomoticaProfileItem } from '../../../__tests__/factories'

const initial = {
  profiles: null,
  fetching: false,
  saving: false,
  profileItems: {},
  loadingItems: {},
  isError: false,
  error: {},
}

describe('domoticaCommandProfileReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch profiles', () => {
    it('fetchProfilesRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchProfilesRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('beginFetchProfiles also sets fetching', () => {
      expect(reducer(initial, actions.beginFetchProfiles()).fetching).toBe(true)
    })

    it('successFetchProfiles stores profiles', () => {
      const profiles = [makeDomoticaProfile()]
      const s = reducer({ ...initial, fetching: true }, actions.successFetchProfiles(profiles))
      expect(s.profiles).toEqual(profiles)
      expect(s.fetching).toBe(false)
    })

    it('errorFetchProfiles sets isError', () => {
      const s = reducer(initial, actions.errorFetchProfiles('error'))
      expect(s.isError).toBe(true)
      expect(s.fetching).toBe(false)
    })
  })

  describe('create profile', () => {
    it('beginCreateProfile sets saving', () => {
      expect(reducer(initial, actions.beginCreateProfile()).saving).toBe(true)
    })

    it('successCreateProfile appends profile', () => {
      const p = makeDomoticaProfile()
      const s = reducer({ ...initial, profiles: [], saving: true }, actions.successCreateProfile(p))
      expect(s.profiles).toEqual([p])
      expect(s.saving).toBe(false)
    })

    it('successCreateProfile initializes profiles when null', () => {
      const p = makeDomoticaProfile()
      expect(reducer(initial, actions.successCreateProfile(p)).profiles).toEqual([p])
    })

    it('errorCreateProfile sets isError', () => {
      const s = reducer(initial, actions.errorCreateProfile('create error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('update profile', () => {
    it('beginUpdateProfile sets saving', () => {
      expect(reducer(initial, actions.beginUpdateProfile()).saving).toBe(true)
    })

    it('successUpdateProfile replaces profile by id', () => {
      const p1 = makeDomoticaProfile({ id: 'profile-1', name: 'Old' })
      const p2 = makeDomoticaProfile({ id: 'profile-2', name: 'Other' })
      const updated = makeDomoticaProfile({ id: 'profile-1', name: 'New' })
      const s = reducer(
        { ...initial, profiles: [p1, p2], saving: true },
        actions.successUpdateProfile(updated),
      )
      expect(s.profiles.find((p) => p.id === 'profile-1').name).toBe('New')
      expect(s.profiles.find((p) => p.id === 'profile-2').name).toBe('Other')
      expect(s.saving).toBe(false)
    })

    it('errorUpdateProfile sets isError', () => {
      const s = reducer(initial, actions.errorUpdateProfile('update error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('delete profile', () => {
    it('beginDeleteProfile sets saving', () => {
      expect(reducer(initial, actions.beginDeleteProfile()).saving).toBe(true)
    })

    it('successDeleteProfile removes profile and cleans up profileItems and loadingItems', () => {
      const p = makeDomoticaProfile({ id: 'profile-1' })
      const state = {
        ...initial,
        profiles: [p],
        profileItems: { 'profile-1': [makeDomoticaProfileItem()] },
        loadingItems: { 'profile-1': false },
        saving: true,
      }
      const s = reducer(state, actions.successDeleteProfile({ id: 'profile-1' }))
      expect(s.profiles).toHaveLength(0)
      expect(s.profileItems['profile-1']).toBeUndefined()
      expect(s.loadingItems['profile-1']).toBeUndefined()
      expect(s.saving).toBe(false)
    })

    it('errorDeleteProfile sets isError', () => {
      const s = reducer(initial, actions.errorDeleteProfile('delete error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('fetch items', () => {
    it('fetchItemsRequest marks profileId as loading', () => {
      const s = reducer(initial, actions.fetchItemsRequest({ profileId: 'profile-1' }))
      expect(s.loadingItems['profile-1']).toBe(true)
    })

    it('successFetchItems stores items and clears loading', () => {
      const items = [makeDomoticaProfileItem()]
      const state = { ...initial, loadingItems: { 'profile-1': true } }
      const s = reducer(state, actions.successFetchItems({ profileId: 'profile-1', data: items }))
      expect(s.profileItems['profile-1']).toEqual(items)
      expect(s.loadingItems['profile-1']).toBe(false)
    })

    it('errorFetchItems clears loading', () => {
      const state = { ...initial, loadingItems: { 'profile-1': true } }
      const s = reducer(state, actions.errorFetchItems({ profileId: 'profile-1' }))
      expect(s.loadingItems['profile-1']).toBe(false)
    })
  })

  describe('item CRUD', () => {
    it('beginCreateItem sets saving', () => {
      expect(reducer(initial, actions.beginCreateItem()).saving).toBe(true)
    })

    it('successCreateItem appends item to profile', () => {
      const item = makeDomoticaProfileItem({ id: 'item-1', profileId: 'profile-1' })
      const state = { ...initial, profileItems: { 'profile-1': [] }, saving: true }
      const s = reducer(state, actions.successCreateItem(item))
      expect(s.profileItems['profile-1']).toHaveLength(1)
      expect(s.profileItems['profile-1'][0].id).toBe('item-1')
      expect(s.saving).toBe(false)
    })

    it('successCreateItem initializes list when profile has no items yet', () => {
      const item = makeDomoticaProfileItem({ id: 'item-1', profileId: 'profile-1' })
      const s = reducer(initial, actions.successCreateItem(item))
      expect(s.profileItems['profile-1']).toEqual([item])
    })

    it('successUpdateItem replaces item by id within its profile', () => {
      const item1 = makeDomoticaProfileItem({ id: 'item-1', profileId: 'profile-1', order: 0 })
      const item2 = makeDomoticaProfileItem({ id: 'item-2', profileId: 'profile-1', order: 1 })
      const updated = { ...item1, order: 5 }
      const state = { ...initial, profileItems: { 'profile-1': [item1, item2] } }
      const s = reducer(state, actions.successUpdateItem(updated))
      expect(s.profileItems['profile-1'].find((i) => i.id === 'item-1').order).toBe(5)
      expect(s.profileItems['profile-1'].find((i) => i.id === 'item-2').order).toBe(1)
    })

    it('successDeleteItem removes item by id within its profile', () => {
      const item1 = makeDomoticaProfileItem({ id: 'item-1', profileId: 'profile-1' })
      const item2 = makeDomoticaProfileItem({ id: 'item-2', profileId: 'profile-1' })
      const state = { ...initial, profileItems: { 'profile-1': [item1, item2] } }
      const s = reducer(state, actions.successDeleteItem({ profileId: 'profile-1', id: 'item-1' }))
      expect(s.profileItems['profile-1']).toHaveLength(1)
      expect(s.profileItems['profile-1'][0].id).toBe('item-2')
    })

    it('successReorderItems replaces items list for profile', () => {
      const reordered = [
        makeDomoticaProfileItem({ id: 'item-2', profileId: 'profile-1', order: 0 }),
        makeDomoticaProfileItem({ id: 'item-1', profileId: 'profile-1', order: 1 }),
      ]
      const s = reducer(initial, actions.successReorderItems({ profileId: 'profile-1', items: reordered }))
      expect(s.profileItems['profile-1']).toEqual(reordered)
    })
  })
})
