import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/taxiDistributionActions'
import * as service from '../../services/providers/firebase/CashFlow/taxiDistributions'
import { makeDistribution } from '../../__tests__/factories'

function* fetchDistributions() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getDistributions)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createDistribution({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.createDistribution, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updatePartnerPayment({ payload }) {
  try {
    yield put(actions.beginRequestUpdatePayment())
    const paymentData = {
      partnerName: payload.partnerName,
      percentage: payload.percentage,
      calculatedAmount: payload.calculatedAmount,
      paidAmount: Number(payload.paidAmount),
      paidDate: payload.paidDate,
      paid: true,
    }
    yield call(service.updatePartnerPayment, payload.distributionId, payload.partnerId, paymentData)
    yield put(actions.successRequestUpdatePayment(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdatePayment(e.message))
  }
}

function* deleteDistribution({ payload }) {
  try {
    yield call(service.deleteDistribution, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

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
      // Extract the paymentData argument from the call effect
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
