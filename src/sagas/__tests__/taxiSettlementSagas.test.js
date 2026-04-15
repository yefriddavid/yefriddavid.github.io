import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiSettlementActions'
import * as service from '../../services/providers/firebase/Taxi/taxiSettlements'
import { fetchSettlements, createSettlement, updateSettlement, deleteSettlement } from '../Taxi/taxiSettlementSagas'
import { makeSettlement } from '../../__tests__/factories'

describe('taxiSettlementSagas', () => {
  describe('fetchSettlements', () => {
    it('begin → getSettlements → success', () => {
      const gen = fetchSettlements()
      const records = [makeSettlement()]
      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getSettlements))
      expect(gen.next(records).value).toEqual(put(actions.successRequestFetch(records)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestFetch', () => {
      const gen = fetchSettlements()
      gen.next(); gen.next()
      expect(gen.throw(new Error('unavailable')).value).toEqual(put(actions.errorRequestFetch('unavailable')))
    })
  })

  describe('createSettlement', () => {
    it('uppercases plate before dispatching success', () => {
      const payload = makeSettlement({ id: undefined, plate: 'xyz789', amount: '65000', comment: '' })
      const gen = createSettlement({ payload })
      gen.next(); gen.next()
      const { payload: dispatched } = gen.next('new-id').value.payload.action
      expect(dispatched.plate).toBe('XYZ789')
    })

    it('converts amount string to Number', () => {
      const payload = makeSettlement({ id: undefined, plate: 'ABC123', amount: '65000', comment: '' })
      const gen = createSettlement({ payload })
      gen.next(); gen.next()
      const { payload: dispatched } = gen.next('new-id').value.payload.action
      expect(dispatched.amount).toBe(65000)
      expect(typeof dispatched.amount).toBe('number')
    })

    it('sets comment to null when empty string', () => {
      const payload = makeSettlement({ id: undefined, comment: '' })
      const gen = createSettlement({ payload })
      gen.next(); gen.next()
      const { payload: dispatched } = gen.next('new-id').value.payload.action
      expect(dispatched.comment).toBeNull()
    })

    it('preserves comment when provided', () => {
      const payload = makeSettlement({ id: undefined, comment: 'abono parcial' })
      const gen = createSettlement({ payload })
      gen.next(); gen.next()
      const { payload: dispatched } = gen.next('new-id').value.payload.action
      expect(dispatched.comment).toBe('abono parcial')
    })

    it('error path dispatches errorRequestCreate', () => {
      const gen = createSettlement({ payload: makeSettlement() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('write failed')).value).toEqual(put(actions.errorRequestCreate('write failed')))
    })
  })

  describe('updateSettlement', () => {
    it('begin → updateSettlement(id, payload) → success', () => {
      const payload = makeSettlement()
      const gen = updateSettlement({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
      expect(gen.next().value).toEqual(call(service.updateSettlement, payload.id, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestUpdate(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestUpdate', () => {
      const gen = updateSettlement({ payload: makeSettlement() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('conflict')).value).toEqual(put(actions.errorRequestUpdate('conflict')))
    })
  })

  describe('deleteSettlement', () => {
    it('begin → deleteSettlement(id) → success', () => {
      const payload = makeSettlement()
      const gen = deleteSettlement({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deleteSettlement, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestDelete', () => {
      const gen = deleteSettlement({ payload: makeSettlement() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.errorRequestDelete('not found')))
    })
  })
})
