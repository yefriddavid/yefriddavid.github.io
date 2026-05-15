import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaCommandProfileActions'
import * as service from '../../services/facade/domotica/domoticaCommandProfilesFacade'
import {
  fetchProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
} from '../domotica/domoticaCommandProfileSagas'

const makeProfile = (overrides = {}) => ({
  id: 'profile-1',
  name: 'Configuración APN',
  description: 'Perfil para configurar APN Comcel',
  deviceModel: 'TT8750',
  ...overrides,
})

const makeItem = (overrides = {}) => ({
  id: 'item-1',
  profileId: 'profile-1',
  value: 'AT+CGDCONT=1,"IP","internet.comcel.com.co","",0,0',
  notes: 'Configurar APN principal',
  order: 0,
  ...overrides,
})

describe('domoticaCommandProfileSagas', () => {
  describe('fetchProfiles', () => {
    it('begin → fetchProfiles → success', () => {
      const data = [makeProfile()]
      const gen = fetchProfiles()
      expect(gen.next().value).toEqual(put(actions.beginFetchProfiles()))
      expect(gen.next().value).toEqual(call(service.fetchProfiles))
      expect(gen.next(data).value).toEqual(put(actions.successFetchProfiles(data)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorFetchProfiles', () => {
      const gen = fetchProfiles()
      gen.next()
      gen.next()
      expect(gen.throw(new Error('network error')).value).toEqual(
        put(actions.errorFetchProfiles('network error')),
      )
    })
  })

  describe('createProfile', () => {
    it('begin → createProfile → success with generated id', () => {
      const payload = makeProfile({ id: undefined })
      const newId = 'profile-new'
      const gen = createProfile({ payload })
      expect(gen.next().value).toEqual(put(actions.beginCreateProfile()))
      expect(gen.next().value).toEqual(call(service.createProfile, payload))
      expect(gen.next(newId).value).toEqual(
        put(actions.successCreateProfile({ id: newId, ...payload })),
      )
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorCreateProfile', () => {
      const gen = createProfile({ payload: makeProfile() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('write failed')).value).toEqual(
        put(actions.errorCreateProfile('write failed')),
      )
    })
  })

  describe('updateProfile', () => {
    it('begin → updateProfile(id, payload) → success', () => {
      const payload = makeProfile({ name: 'Updated Name' })
      const gen = updateProfile({ payload })
      expect(gen.next().value).toEqual(put(actions.beginUpdateProfile()))
      expect(gen.next().value).toEqual(call(service.updateProfile, payload.id, payload))
      expect(gen.next().value).toEqual(put(actions.successUpdateProfile(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorUpdateProfile', () => {
      const gen = updateProfile({ payload: makeProfile() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(
        put(actions.errorUpdateProfile('not found')),
      )
    })
  })

  describe('deleteProfile', () => {
    it('begin → deleteProfile(id) → success', () => {
      const payload = makeProfile()
      const gen = deleteProfile({ payload })
      expect(gen.next().value).toEqual(put(actions.beginDeleteProfile()))
      expect(gen.next().value).toEqual(call(service.deleteProfile, payload.id))
      expect(gen.next().value).toEqual(put(actions.successDeleteProfile(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorDeleteProfile', () => {
      const gen = deleteProfile({ payload: makeProfile() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('permission denied')).value).toEqual(
        put(actions.errorDeleteProfile('permission denied')),
      )
    })
  })

  describe('fetchItems', () => {
    it('fetchProfileItems(profileId) → success with { profileId, data }', () => {
      const profileId = 'profile-1'
      const data = [makeItem()]
      const gen = fetchItems({ payload: { profileId } })
      expect(gen.next().value).toEqual(call(service.fetchProfileItems, profileId))
      expect(gen.next(data).value).toEqual(put(actions.successFetchItems({ profileId, data })))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorFetchItems with profileId', () => {
      const profileId = 'profile-1'
      const gen = fetchItems({ payload: { profileId } })
      gen.next()
      expect(gen.throw(new Error('timeout')).value).toEqual(
        put(actions.errorFetchItems({ profileId })),
      )
    })
  })

  describe('createItem', () => {
    it('begin → createProfileItem → success with generated id', () => {
      const payload = makeItem({ id: undefined })
      const newId = 'item-new'
      const gen = createItem({ payload })
      expect(gen.next().value).toEqual(put(actions.beginCreateItem()))
      expect(gen.next().value).toEqual(call(service.createProfileItem, payload))
      expect(gen.next(newId).value).toEqual(
        put(actions.successCreateItem({ id: newId, ...payload })),
      )
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorCreateItem', () => {
      const gen = createItem({ payload: makeItem() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('write error')).value).toEqual(
        put(actions.errorCreateItem('write error')),
      )
    })
  })

  describe('updateItem', () => {
    it('updateProfileItem(id, payload) → success', () => {
      const payload = makeItem({ value: 'AT+CGDCONT=1,"IP","movistar.co","",0,0' })
      const gen = updateItem({ payload })
      expect(gen.next().value).toEqual(call(service.updateProfileItem, payload.id, payload))
      expect(gen.next().value).toEqual(put(actions.successUpdateItem(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorUpdateItem', () => {
      const gen = updateItem({ payload: makeItem() })
      gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(
        put(actions.errorUpdateItem('not found')),
      )
    })
  })

  describe('deleteItem', () => {
    it('deleteProfileItem(id) → success', () => {
      const payload = makeItem()
      const gen = deleteItem({ payload })
      expect(gen.next().value).toEqual(call(service.deleteProfileItem, payload.id))
      expect(gen.next().value).toEqual(put(actions.successDeleteItem(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorDeleteItem', () => {
      const gen = deleteItem({ payload: makeItem() })
      gen.next()
      expect(gen.throw(new Error('permission denied')).value).toEqual(
        put(actions.errorDeleteItem('permission denied')),
      )
    })
  })

  describe('reorderItems', () => {
    it('reorderProfileItems(items) → success', () => {
      const items = [makeItem({ order: 0 }), makeItem({ id: 'item-2', order: 1 })]
      const payload = { profileId: 'profile-1', items }
      const gen = reorderItems({ payload })
      expect(gen.next().value).toEqual(call(service.reorderProfileItems, items))
      expect(gen.next().value).toEqual(put(actions.successReorderItems(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error is silently swallowed — no dispatch', () => {
      const payload = { profileId: 'profile-1', items: [] }
      const gen = reorderItems({ payload })
      gen.next() // call reorderProfileItems
      const result = gen.throw(new Error('batch error'))
      expect(result.done).toBe(true)
    })
  })
})
