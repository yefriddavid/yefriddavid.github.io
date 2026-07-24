import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiVehicleActions'
import * as service from '../../services/facade/taxi/taxiVehicleFacade'
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateRestrictions,
} from '../taxi/taxiVehicleSagas'
import { makeVehicle } from '../../__tests__/factories'

describe('taxiVehicleSagas', () => {
  describe('fetchVehicles', () => {
    it('begin → getVehicles → success', () => {
      const gen = fetchVehicles()
      const vehicles = [makeVehicle()]

      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getVehicles))
      expect(gen.next(vehicles).value).toEqual(put(actions.successRequestFetch(vehicles)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestFetch', () => {
      const gen = fetchVehicles()
      gen.next()
      gen.next()
      expect(gen.throw(new Error('unavailable')).value).toEqual(
        put(actions.errorRequestFetch('unavailable')),
      )
    })
  })

  describe('createVehicle', () => {
    it('uppercases plate before dispatching success', () => {
      const payload = makeVehicle({ id: undefined, plate: 'abc123' })
      const gen = createVehicle({ payload })
      gen.next() // beginRequestCreate
      gen.next() // call addVehicle
      const { payload: dispatched } = gen.next('new-id').value.payload.action
      expect(dispatched.plate).toBe('ABC123')
    })

    it('initializes restrictions as empty object', () => {
      const payload = makeVehicle({ id: undefined, restrictions: undefined })
      const gen = createVehicle({ payload })
      gen.next()
      gen.next()
      const { payload: dispatched } = gen.next('new-id').value.payload.action
      expect(dispatched.restrictions).toEqual({})
    })

    it('full flow: begin → addVehicle → success', () => {
      const payload = makeVehicle({ id: undefined })
      const gen = createVehicle({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(service.addVehicle, payload))
      gen.next('new-id') // successRequestCreate
      gen.next()         // notify success
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestCreate', () => {
      const gen = createVehicle({ payload: makeVehicle() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('write failed')).value).toEqual(
        put(actions.errorRequestCreate('write failed')),
      )
    })
  })

  describe('updateVehicle', () => {
    it('uppercases plate in the success dispatch', () => {
      const payload = makeVehicle({ plate: 'xyz789' })
      const gen = updateVehicle({ payload })
      gen.next() // beginRequestUpdate
      gen.next() // call updateVehicle
      const { payload: dispatched } = gen.next().value.payload.action
      expect(dispatched.plate).toBe('XYZ789')
    })

    it('calls updateVehicle with original payload (before uppercase)', () => {
      const payload = makeVehicle({ plate: 'xyz789' })
      const gen = updateVehicle({ payload })
      gen.next()
      expect(gen.next().value).toEqual(call(service.updateVehicle, payload.id, payload))
    })

    it('error path dispatches errorRequestUpdate', () => {
      const gen = updateVehicle({ payload: makeVehicle() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('conflict')).value).toEqual(
        put(actions.errorRequestUpdate('conflict')),
      )
    })
  })

  describe('deleteVehicle', () => {
    it('begin → deleteVehicle(id) → success', () => {
      const payload = makeVehicle()
      const gen = deleteVehicle({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deleteVehicle, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
    })
  })

  describe('updateRestrictions', () => {
    it('calls service with id and restrictions, then dispatches success', () => {
      const payload = { id: 'v1', restrictions: { 3: { d1: 5, d2: 15 } } }
      const gen = updateRestrictions({ payload })

      expect(gen.next().value).toEqual(
        call(service.updateRestrictions, payload.id, payload.restrictions),
      )
      expect(gen.next().value).toEqual(put(actions.successRequestUpdateRestrictions(payload)))
      gen.next() // notify success
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestUpdateRestrictions', () => {
      const gen = updateRestrictions({ payload: { id: 'v1', restrictions: {} } })
      gen.next() // advance to call(service.updateRestrictions, ...)
      expect(gen.throw(new Error('perm denied')).value).toEqual(
        put(actions.errorRequestUpdateRestrictions('perm denied')),
      )
    })

    it('passes a multi-year restrictions payload through to the service untouched', () => {
      // Vehicles.js merges edits across years (e.g. Aug-Dec of the current
      // decree + January of the next one) into a single object before
      // dispatching — the saga must forward it verbatim, not just one year.
      const yearKeyed = {
        2026: {
          8: { d1: 9, d2: null, d3: null },
          9: { d1: 6, d2: 20, d3: null },
        },
        2027: {
          1: { d1: 4, d2: null, d3: null },
        },
      }
      const payload = { id: 'v1', restrictions: yearKeyed }
      const gen = updateRestrictions({ payload })

      expect(gen.next().value).toEqual(call(service.updateRestrictions, 'v1', yearKeyed))
      expect(gen.next().value).toEqual(put(actions.successRequestUpdateRestrictions(payload)))
    })
  })
})
