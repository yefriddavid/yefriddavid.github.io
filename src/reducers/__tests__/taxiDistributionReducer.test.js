import { describe, it, expect } from 'vitest'
import reducer from '../Taxi/taxiDistributionReducer'
import * as actions from '../../actions/Taxi/taxiDistributionActions'
import { makeDistribution } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('taxiDistributionReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('successRequestFetch stores distributions', () => {
      const dists = [makeDistribution()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(dists))
      expect(s.data).toEqual(dists)
      expect(s.fetching).toBe(false)
    })
  })

  // ── Create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('successRequestCreate prepends (most recent first)', () => {
      const old = makeDistribution({ id: 'dist-old', period: '2024-01' })
      const fresh = makeDistribution({ id: 'dist-new', period: '2024-03' })
      const s = reducer({ ...initial, data: [old] }, actions.successRequestCreate(fresh))
      expect(s.data[0].id).toBe('dist-new')
      expect(s.data[1].id).toBe('dist-old')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data when null', () => {
      const d = makeDistribution()
      expect(reducer(initial, actions.successRequestCreate(d)).data).toEqual([d])
    })
  })

  // ── Update partner payment (nested state surgery) ─────────────────────────
  describe('updatePartnerPayment', () => {
    it('beginRequestUpdatePayment sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.beginRequestUpdatePayment())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestUpdatePayment marks the correct partner as paid', () => {
      const dist = makeDistribution({ id: 'dist-1' })
      const s = reducer(
        { ...initial, data: [dist] },
        actions.successRequestUpdatePayment({
          distributionId: 'dist-1',
          partnerId: 'partner-1',
          paidAmount: 500000,
          paidDate: '2024-03-31',
        }),
      )
      const updated = s.data[0].payments['partner-1']
      expect(updated.paid).toBe(true)
      expect(updated.paidAmount).toBe(500000)
      expect(updated.paidDate).toBe('2024-03-31')
    })

    it('does not mutate other partners in the same distribution', () => {
      const dist = makeDistribution({ id: 'dist-1' })
      const s = reducer(
        { ...initial, data: [dist] },
        actions.successRequestUpdatePayment({
          distributionId: 'dist-1',
          partnerId: 'partner-1',
          paidAmount: 500000,
          paidDate: '2024-03-31',
        }),
      )
      const partner2 = s.data[0].payments['partner-2']
      expect(partner2.paid).toBe(false)
      expect(partner2.paidAmount).toBeNull()
    })

    it('does not mutate other distributions', () => {
      const dist1 = makeDistribution({ id: 'dist-1' })
      const dist2 = makeDistribution({ id: 'dist-2', period: '2024-02' })
      const s = reducer(
        { ...initial, data: [dist1, dist2] },
        actions.successRequestUpdatePayment({
          distributionId: 'dist-1',
          partnerId: 'partner-1',
          paidAmount: 500000,
          paidDate: '2024-03-31',
        }),
      )
      const untouched = s.data.find((d) => d.id === 'dist-2')
      expect(untouched.payments['partner-1'].paid).toBe(false)
    })

    it('errorRequestUpdatePayment sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdatePayment('write error'))
      expect(s.isError).toBe(true)
      expect(s.fetching).toBe(false)
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes distribution by id', () => {
      const d1 = makeDistribution({ id: 'd1' })
      const d2 = makeDistribution({ id: 'd2', period: '2024-02' })
      const s = reducer({ ...initial, data: [d1, d2] }, actions.successRequestDelete({ id: 'd1' }))
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('d2')
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
    })
  })
})
