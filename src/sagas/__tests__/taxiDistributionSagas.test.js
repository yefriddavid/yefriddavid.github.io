import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiDistributionActions'
import * as service from '../../services/providers/firebase/Taxi/taxiDistributions'
import { fetchDistributions, createDistribution, updatePartnerPayment, deleteDistribution } from '../Taxi/taxiDistributionSagas'
import { makeDistribution } from '../../__tests__/factories'

describe('taxiDistributionSagas', () => {
  describe('fetchDistributions', () => {
    it('begin → getDistributions → success', () => {
      const gen = fetchDistributions()
      const dists = [makeDistribution()]
      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getDistributions))
      expect(gen.next(dists).value).toEqual(put(actions.successRequestFetch(dists)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestFetch', () => {
      const gen = fetchDistributions()
      gen.next(); gen.next()
      expect(gen.throw(new Error('unavailable')).value).toEqual(put(actions.errorRequestFetch('unavailable')))
    })
  })

  describe('createDistribution', () => {
    it('begin → createDistribution(payload) → success with id spread', () => {
      const payload = makeDistribution({ id: undefined })
      const gen = createDistribution({ payload })
      const newId = 'dist-abc'

      expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(service.createDistribution, payload))
      expect(gen.next(newId).value).toEqual(put(actions.successRequestCreate({ id: newId, ...payload })))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestCreate', () => {
      const gen = createDistribution({ payload: makeDistribution() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('write failed')).value).toEqual(put(actions.errorRequestCreate('write failed')))
    })
  })

  describe('updatePartnerPayment', () => {
    const payload = {
      distributionId: 'dist-1',
      partnerId: 'partner-1',
      partnerName: 'Socio A',
      percentage: 40,
      calculatedAmount: 520000,
      paidAmount: '500000',
      paidDate: '2024-03-31',
    }

    it('converts paidAmount string to Number', () => {
      const gen = updatePartnerPayment({ payload })
      gen.next()           // beginRequestUpdatePayment

      const callEffect = gen.next().value
      const paymentDataArg = callEffect.payload.args[2]
      expect(paymentDataArg.paidAmount).toBe(500000)
      expect(typeof paymentDataArg.paidAmount).toBe('number')
    })

    it('hardcodes paid: true in the paymentData sent to Firestore', () => {
      const gen = updatePartnerPayment({ payload })
      gen.next()
      const callEffect = gen.next().value
      const paymentDataArg = callEffect.payload.args[2]
      expect(paymentDataArg.paid).toBe(true)
    })

    it('sends correct distributionId and partnerId to the service', () => {
      const gen = updatePartnerPayment({ payload })
      gen.next()
      const callEffect = gen.next().value
      expect(callEffect.payload.args[0]).toBe('dist-1')
      expect(callEffect.payload.args[1]).toBe('partner-1')
    })

    it('full flow: begin → updatePartnerPayment → success', () => {
      const gen = updatePartnerPayment({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestUpdatePayment()))
      gen.next()           // call updatePartnerPayment
      expect(gen.next().value).toEqual(put(actions.successRequestUpdatePayment(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestUpdatePayment', () => {
      const gen = updatePartnerPayment({ payload })
      gen.next(); gen.next()
      expect(gen.throw(new Error('perm denied')).value).toEqual(
        put(actions.errorRequestUpdatePayment('perm denied')),
      )
    })
  })

  describe('deleteDistribution', () => {
    it('deleteDistribution(id) → success (no begin action)', () => {
      const payload = makeDistribution()
      const gen = deleteDistribution({ payload })
      expect(gen.next().value).toEqual(call(service.deleteDistribution, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestDelete', () => {
      const gen = deleteDistribution({ payload: makeDistribution() })
      gen.next() // advance to call(service.deleteDistribution, ...)
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.errorRequestDelete('not found')))
    })
  })
})
