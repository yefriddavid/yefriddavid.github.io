import { describe, it, expect } from 'vitest'
import reducer from '../taxiSettlementReducer'
import * as actions from '../../actions/taxiSettlementActions'

const initialState = { data: null, error: {}, fetching: false, isError: false }

const makeRecord = (overrides = {}) => ({
  id: 'rec1',
  driver: 'Juan Perez',
  plate: 'ABC123',
  amount: 50000,
  date: '2024-03-10',
  comment: null,
  ...overrides,
})

describe('taxiSettlementReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  // ── Fetch ────────────────────────────────────────────────────────────────────
  it('fetchRequest sets fetching = true', () => {
    expect(reducer(initialState, actions.fetchRequest()).fetching).toBe(true)
  })

  it('beginRequestFetch sets fetching = true', () => {
    expect(reducer(initialState, actions.beginRequestFetch()).fetching).toBe(true)
  })

  it('successRequestFetch sets data and clears fetching', () => {
    const records = [makeRecord()]
    const state = reducer({ ...initialState, fetching: true }, actions.successRequestFetch(records))
    expect(state.data).toEqual(records)
    expect(state.fetching).toBe(false)
  })

  it('errorRequestFetch sets isError and error payload', () => {
    const state = reducer({ ...initialState, fetching: true }, actions.errorRequestFetch('timeout'))
    expect(state.isError).toBe(true)
    expect(state.fetching).toBe(false)
    expect(state.error).toBe('timeout')
  })

  // ── Create ───────────────────────────────────────────────────────────────────
  it('beginRequestCreate sets fetching = true', () => {
    expect(reducer(initialState, actions.beginRequestCreate()).fetching).toBe(true)
  })

  it('successRequestCreate prepends to existing data', () => {
    const existing = makeRecord({ id: 'old' })
    const newRec = makeRecord({ id: 'new', date: '2024-03-11' })
    const state = reducer(
      { ...initialState, data: [existing] },
      actions.successRequestCreate(newRec),
    )
    expect(state.data[0]).toEqual(newRec)
    expect(state.data[1]).toEqual(existing)
    expect(state.fetching).toBe(false)
  })

  it('successRequestCreate initializes data when null', () => {
    const rec = makeRecord()
    const state = reducer(initialState, actions.successRequestCreate(rec))
    expect(state.data).toEqual([rec])
  })

  it('errorRequestCreate sets error and clears fetching', () => {
    const state = reducer({ ...initialState, fetching: true }, actions.errorRequestCreate('forbidden'))
    expect(state.isError).toBe(true)
    expect(state.fetching).toBe(false)
    expect(state.error).toBe('forbidden')
  })

  // ── Update ───────────────────────────────────────────────────────────────────
  it('beginRequestUpdate sets fetching = true and clears isError', () => {
    const state = reducer({ ...initialState, isError: true }, actions.beginRequestUpdate())
    expect(state.fetching).toBe(true)
    expect(state.isError).toBe(false)
  })

  it('successRequestUpdate merges fields for matching id', () => {
    const rec = makeRecord({ id: 'r1', amount: 50000 })
    const state = reducer(
      { ...initialState, data: [rec] },
      actions.successRequestUpdate({ id: 'r1', amount: 60000, comment: 'ajuste' }),
    )
    expect(state.data[0].amount).toBe(60000)
    expect(state.data[0].comment).toBe('ajuste')
    expect(state.data[0].driver).toBe(rec.driver)
    expect(state.fetching).toBe(false)
  })

  it('successRequestUpdate does not modify other records', () => {
    const r1 = makeRecord({ id: 'r1', amount: 50000 })
    const r2 = makeRecord({ id: 'r2', amount: 80000 })
    const state = reducer(
      { ...initialState, data: [r1, r2] },
      actions.successRequestUpdate({ id: 'r1', amount: 55000 }),
    )
    expect(state.data[1].amount).toBe(80000)
  })

  it('successRequestUpdate is a no-op when data is null', () => {
    const state = reducer(initialState, actions.successRequestUpdate({ id: 'r1', amount: 10000 }))
    expect(state.data).toBeNull()
  })

  // ── Delete ───────────────────────────────────────────────────────────────────
  it('successRequestDelete removes record by id', () => {
    const r1 = makeRecord({ id: 'r1' })
    const r2 = makeRecord({ id: 'r2' })
    const state = reducer(
      { ...initialState, data: [r1, r2] },
      actions.successRequestDelete({ id: 'r1' }),
    )
    expect(state.data).toHaveLength(1)
    expect(state.data[0].id).toBe('r2')
  })

  it('errorRequestDelete sets isError', () => {
    const state = reducer(initialState, actions.errorRequestDelete('not found'))
    expect(state.isError).toBe(true)
    expect(state.error).toBe('not found')
  })
})
