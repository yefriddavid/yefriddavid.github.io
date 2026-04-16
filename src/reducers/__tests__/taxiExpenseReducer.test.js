import { describe, it, expect } from 'vitest'
import reducer from '../taxi/taxiExpenseReducer'
import * as actions from '../../actions/taxi/taxiExpenseActions'
import { makeExpense } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('taxiExpenseReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores expenses', () => {
      const expenses = [makeExpense()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(expenses))
      expect(s.data).toEqual(expenses)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('unavailable'))
      expect(s.isError).toBe(true)
      expect(s.fetching).toBe(false)
    })
  })

  // ── Create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('successRequestCreate prepends (most recent first)', () => {
      const old = makeExpense({ id: 'e-old', date: '2024-03-01' })
      const fresh = makeExpense({ id: 'e-new', date: '2024-03-10' })
      const s = reducer({ ...initial, data: [old] }, actions.successRequestCreate(fresh))
      expect(s.data[0].id).toBe('e-new')
      expect(s.data[1].id).toBe('e-old')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data when null', () => {
      const e = makeExpense()
      expect(reducer(initial, actions.successRequestCreate(e)).data).toEqual([e])
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes expense by id', () => {
      const e1 = makeExpense({ id: 'e1' })
      const e2 = makeExpense({ id: 'e2', description: 'Lavado' })
      const s = reducer({ ...initial, data: [e1, e2] }, actions.successRequestDelete({ id: 'e1' }))
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('e2')
    })

    it('successRequestDelete is a no-op when data is null', () => {
      expect(reducer(initial, actions.successRequestDelete({ id: 'e1' })).data).toBeNull()
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
    })
  })

  // ── Toggle paid ───────────────────────────────────────────────────────────
  describe('togglePaid', () => {
    it('successRequestTogglePaid flips paid flag for matching expense', () => {
      const e = makeExpense({ id: 'e1', paid: false })
      const s = reducer(
        { ...initial, data: [e] },
        actions.successRequestTogglePaid({ id: 'e1', paid: true }),
      )
      expect(s.data[0].paid).toBe(true)
    })

    it('successRequestTogglePaid can mark an expense as unpaid', () => {
      const e = makeExpense({ id: 'e1', paid: true })
      const s = reducer(
        { ...initial, data: [e] },
        actions.successRequestTogglePaid({ id: 'e1', paid: false }),
      )
      expect(s.data[0].paid).toBe(false)
    })

    it('successRequestTogglePaid does not affect other expenses', () => {
      const e1 = makeExpense({ id: 'e1', paid: false })
      const e2 = makeExpense({ id: 'e2', paid: false })
      const s = reducer(
        { ...initial, data: [e1, e2] },
        actions.successRequestTogglePaid({ id: 'e1', paid: true }),
      )
      expect(s.data[1].paid).toBe(false)
    })

    it('successRequestTogglePaid preserves all other fields', () => {
      const e = makeExpense({ id: 'e1', paid: false, amount: 80000, description: 'Aceite' })
      const s = reducer(
        { ...initial, data: [e] },
        actions.successRequestTogglePaid({ id: 'e1', paid: true }),
      )
      expect(s.data[0].amount).toBe(80000)
      expect(s.data[0].description).toBe('Aceite')
    })
  })
})
