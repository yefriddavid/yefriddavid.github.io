import { describe, it, expect } from 'vitest'
import reducer from '../domoticaDeviceReducer'
import * as actions from '../../../actions/domotica/domoticaDeviceActions'
import { makeDomoticaDevice } from '../../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('domoticaDeviceReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('beginRequestFetch sets fetching', () => {
      expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
    })

    it('successRequestFetch stores devices', () => {
      const devices = [makeDomoticaDevice()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(devices))
      expect(s.data).toEqual(devices)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer(initial, actions.errorRequestFetch('network error'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('network error')
    })
  })

  describe('create', () => {
    it('beginRequestCreate sets fetching', () => {
      expect(reducer(initial, actions.beginRequestCreate()).fetching).toBe(true)
    })

    it('successRequestCreate appends device', () => {
      const d1 = makeDomoticaDevice({ id: 'dev-1' })
      const d2 = makeDomoticaDevice({ id: 'dev-2', name: 'New sensor' })
      const s = reducer(
        { ...initial, data: [d1], fetching: true },
        actions.successRequestCreate(d2),
      )
      expect(s.data).toHaveLength(2)
      expect(s.data[1].id).toBe('dev-2')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data when null', () => {
      const d = makeDomoticaDevice()
      expect(reducer(initial, actions.successRequestCreate(d)).data).toEqual([d])
    })

    it('errorRequestCreate sets isError', () => {
      const s = reducer(initial, actions.errorRequestCreate('create error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('update', () => {
    it('beginRequestUpdate sets fetching', () => {
      expect(reducer(initial, actions.beginRequestUpdate()).fetching).toBe(true)
    })

    it('successRequestUpdate replaces device by id', () => {
      const d1 = makeDomoticaDevice({ id: 'dev-1', name: 'Old' })
      const d2 = makeDomoticaDevice({ id: 'dev-2', name: 'Other' })
      const updated = { id: 'dev-1', name: 'New', type: 'actuator', active: false, topic: 'home/new' }
      const s = reducer(
        { ...initial, data: [d1, d2], fetching: true },
        actions.successRequestUpdate(updated),
      )
      expect(s.data.find((d) => d.id === 'dev-1').name).toBe('New')
      expect(s.data.find((d) => d.id === 'dev-2').name).toBe('Other')
      expect(s.fetching).toBe(false)
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('update error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('delete', () => {
    it('beginRequestDelete sets fetching', () => {
      expect(reducer(initial, actions.beginRequestDelete()).fetching).toBe(true)
    })

    it('successRequestDelete removes device by id', () => {
      const d1 = makeDomoticaDevice({ id: 'dev-1' })
      const d2 = makeDomoticaDevice({ id: 'dev-2', name: 'Keep' })
      const s = reducer(
        { ...initial, data: [d1, d2], fetching: true },
        actions.successRequestDelete({ id: 'dev-1' }),
      )
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('dev-2')
      expect(s.fetching).toBe(false)
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('delete error'))
      expect(s.isError).toBe(true)
    })
  })
})
