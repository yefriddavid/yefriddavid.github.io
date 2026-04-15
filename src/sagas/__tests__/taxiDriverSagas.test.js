import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiDriverActions'
import * as service from '../../services/providers/firebase/Taxi/taxiDrivers'
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from '../Taxi/taxiDriverSagas'
import { makeDriver } from '../../__tests__/factories'

describe('taxiDriverSagas', () => {
  describe('fetchDrivers', () => {
    it('dispatches beginRequestFetch → getDrivers → successRequestFetch', () => {
      const gen = fetchDrivers()
      const drivers = [makeDriver()]

      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getDrivers))
      expect(gen.next(drivers).value).toEqual(put(actions.successRequestFetch(drivers)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestFetch on service failure', () => {
      const gen = fetchDrivers()
      gen.next()           // beginRequestFetch
      gen.next()           // call getDrivers
      expect(gen.throw(new Error('timeout')).value).toEqual(put(actions.errorRequestFetch('timeout')))
    })
  })

  describe('createDriver', () => {
    it('converts defaultAmount string to Number', () => {
      const payload = makeDriver({ id: undefined, defaultAmount: '60000', defaultAmountSunday: '35000' })
      const gen = createDriver({ payload })
      const newId = 'new-driver'

      gen.next()           // beginRequestCreate
      gen.next()           // call addDriver

      const { payload: dispatched } = gen.next(newId).value.payload.action
      expect(dispatched.defaultAmount).toBe(60000)
      expect(dispatched.defaultAmountSunday).toBe(35000)
      expect(typeof dispatched.defaultAmount).toBe('number')
    })

    it('sets defaultAmount to null when empty string', () => {
      const payload = makeDriver({ id: undefined, defaultAmount: '', defaultAmountSunday: '' })
      const gen = createDriver({ payload })
      gen.next(); gen.next()
      const { payload: dispatched } = gen.next('id').value.payload.action
      expect(dispatched.defaultAmount).toBeNull()
      expect(dispatched.defaultAmountSunday).toBeNull()
    })

    it('sets defaultVehicle to null when empty string', () => {
      const payload = makeDriver({ id: undefined, defaultVehicle: '' })
      const gen = createDriver({ payload })
      gen.next(); gen.next()
      const { payload: dispatched } = gen.next('id').value.payload.action
      expect(dispatched.defaultVehicle).toBeNull()
    })

    it('full success flow: begin → addDriver → success', () => {
      const payload = makeDriver({ id: undefined })
      const gen = createDriver({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(service.addDriver, payload))
      gen.next('new-id')   // success
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestCreate on failure', () => {
      const gen = createDriver({ payload: makeDriver() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('forbidden')).value).toEqual(put(actions.errorRequestCreate('forbidden')))
    })
  })

  describe('updateDriver', () => {
    it('dispatches beginRequestUpdate → updateDriver(id, payload) → success', () => {
      const payload = makeDriver()
      const gen = updateDriver({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
      expect(gen.next().value).toEqual(call(service.updateDriver, payload.id, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestUpdate(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestUpdate on failure', () => {
      const gen = updateDriver({ payload: makeDriver() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('conflict')).value).toEqual(put(actions.errorRequestUpdate('conflict')))
    })
  })

  describe('deleteDriver', () => {
    it('dispatches beginRequestDelete → deleteDriver(id) → success', () => {
      const payload = makeDriver()
      const gen = deleteDriver({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deleteDriver, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestDelete on failure', () => {
      const gen = deleteDriver({ payload: makeDriver() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.errorRequestDelete('not found')))
    })
  })
})
