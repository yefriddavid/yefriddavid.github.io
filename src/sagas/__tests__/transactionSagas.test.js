import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/transactionActions'
import * as service from '../../services/providers/firebase/CashFlow/transactions'

// Step-through generator copies (standard redux-saga testing pattern)
function* fetchTransactions({ payload }) {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getTransactions, payload?.year ?? new Date().getFullYear())
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createTransaction({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addTransaction, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateTransaction({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateTransaction, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteTransaction({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteTransaction, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

// ── Factories ─────────────────────────────────────────────────────────────────
const makeTxPayload = (overrides = {}) => ({
  type: 'income',
  category: 'Salario',
  description: 'Test income',
  amount: 200000,
  date: '2026-04-10',
  accountMasterId: 'master-1',
  ...overrides,
})

// ── fetchTransactions ─────────────────────────────────────────────────────────
describe('fetchTransactions', () => {
  it('beginRequestFetch → getTransactions(year) → successRequestFetch on success', () => {
    const year = 2026
    const data = [{ id: 'tx-1', amount: 100000 }]
    const gen = fetchTransactions({ payload: { year } })

    expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
    expect(gen.next().value).toEqual(call(service.getTransactions, year))
    expect(gen.next(data).value).toEqual(put(actions.successRequestFetch(data)))
    expect(gen.next().done).toBe(true)
  })

  it('dispatches errorRequestFetch on thrown exception', () => {
    const gen = fetchTransactions({ payload: { year: 2026 } })
    gen.next() // beginRequestFetch
    gen.next() // call getTransactions
    const error = new Error('Firestore unavailable')
    expect(gen.throw(error).value).toEqual(
      put(actions.errorRequestFetch('Firestore unavailable')),
    )
    expect(gen.next().done).toBe(true)
  })
})

// ── createTransaction ─────────────────────────────────────────────────────────
describe('createTransaction', () => {
  it('beginRequestCreate → addTransaction(payload) → successRequestCreate with new id', () => {
    const payload = makeTxPayload()
    const newId = 'new-firestore-id'
    const gen = createTransaction({ payload })

    expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
    expect(gen.next().value).toEqual(call(service.addTransaction, payload))
    expect(gen.next(newId).value).toEqual(
      put(actions.successRequestCreate({ id: newId, ...payload })),
    )
    expect(gen.next().done).toBe(true)
  })

  it('dispatches errorRequestCreate on thrown exception', () => {
    const gen = createTransaction({ payload: makeTxPayload() })
    gen.next() // beginRequestCreate
    gen.next() // call addTransaction
    const error = new Error('Write permission denied')
    expect(gen.throw(error).value).toEqual(
      put(actions.errorRequestCreate('Write permission denied')),
    )
    expect(gen.next().done).toBe(true)
  })
})

// ── updateTransaction ─────────────────────────────────────────────────────────
describe('updateTransaction', () => {
  it('beginRequestUpdate → updateTransaction(id, payload) → successRequestUpdate', () => {
    const payload = { id: 'tx-1', ...makeTxPayload(), note: 'updated note' }
    const gen = updateTransaction({ payload })

    expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
    expect(gen.next().value).toEqual(call(service.updateTransaction, payload.id, payload))
    expect(gen.next().value).toEqual(put(actions.successRequestUpdate(payload)))
    expect(gen.next().done).toBe(true)
  })

  it('dispatches errorRequestUpdate on thrown exception', () => {
    const payload = { id: 'tx-1', ...makeTxPayload() }
    const gen = updateTransaction({ payload })
    gen.next() // beginRequestUpdate
    gen.next() // call updateTransaction
    const error = new Error('Network error')
    expect(gen.throw(error).value).toEqual(
      put(actions.errorRequestUpdate('Network error')),
    )
    expect(gen.next().done).toBe(true)
  })
})

// ── deleteTransaction ─────────────────────────────────────────────────────────
describe('deleteTransaction', () => {
  it('beginRequestDelete → deleteTransaction(id) → successRequestDelete', () => {
    const payload = { id: 'tx-1' }
    const gen = deleteTransaction({ payload })

    expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
    expect(gen.next().value).toEqual(call(service.deleteTransaction, payload.id))
    expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
    expect(gen.next().done).toBe(true)
  })

  it('dispatches errorRequestDelete on thrown exception', () => {
    const payload = { id: 'tx-1' }
    const gen = deleteTransaction({ payload })
    gen.next() // beginRequestDelete
    gen.next() // call deleteTransaction
    const error = new Error('Document not found')
    expect(gen.throw(error).value).toEqual(
      put(actions.errorRequestDelete('Document not found')),
    )
    expect(gen.next().done).toBe(true)
  })
})
