import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiExpenseActions'
import * as service from '../../services/providers/firebase/CashFlow/taxiExpenses'
import { makeExpense } from '../../__tests__/factories'

function* fetchExpenses() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.fetchExpenses)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createExpense({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.createExpense, payload)
    yield put(actions.successRequestCreate({ id, ...payload, amount: Number(payload.amount) }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* deleteExpense({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteExpense, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* togglePaid({ payload }) {
  try {
    yield call(service.toggleExpensePaid, payload.id, payload.paid)
    yield put(actions.successRequestTogglePaid(payload))
  } catch (e) {
    yield put(actions.errorRequestTogglePaid(e.message))
  }
}

describe('taxiExpenseSagas', () => {
  describe('fetchExpenses', () => {
    it('begin → fetchExpenses → success', () => {
      const gen = fetchExpenses()
      const expenses = [makeExpense()]
      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.fetchExpenses))
      expect(gen.next(expenses).value).toEqual(put(actions.successRequestFetch(expenses)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestFetch', () => {
      const gen = fetchExpenses()
      gen.next(); gen.next()
      expect(gen.throw(new Error('timeout')).value).toEqual(put(actions.errorRequestFetch('timeout')))
    })
  })

  describe('createExpense', () => {
    it('converts amount string to Number', () => {
      const payload = makeExpense({ id: undefined, amount: '80000' })
      const gen = createExpense({ payload })
      gen.next()           // beginRequestCreate
      gen.next()           // call createExpense
      const { payload: dispatched } = gen.next('e-id').value.payload.action
      expect(dispatched.amount).toBe(80000)
      expect(typeof dispatched.amount).toBe('number')
    })

    it('full flow: begin → createExpense → success', () => {
      const payload = makeExpense({ id: undefined })
      const gen = createExpense({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(service.createExpense, payload))
      gen.next('new-id')
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestCreate', () => {
      const gen = createExpense({ payload: makeExpense() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('write error')).value).toEqual(put(actions.errorRequestCreate('write error')))
    })
  })

  describe('deleteExpense', () => {
    it('begin → deleteExpense(id) → success', () => {
      const payload = makeExpense()
      const gen = deleteExpense({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deleteExpense, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestDelete', () => {
      const gen = deleteExpense({ payload: makeExpense() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.errorRequestDelete('not found')))
    })
  })

  describe('togglePaid', () => {
    it('calls toggleExpensePaid with id and paid flag, then dispatches success', () => {
      const payload = { id: 'e1', paid: true }
      const gen = togglePaid({ payload })

      expect(gen.next().value).toEqual(call(service.toggleExpensePaid, 'e1', true))
      expect(gen.next().value).toEqual(put(actions.successRequestTogglePaid(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('works for unpaid toggle (paid: false)', () => {
      const payload = { id: 'e1', paid: false }
      const gen = togglePaid({ payload })
      expect(gen.next().value).toEqual(call(service.toggleExpensePaid, 'e1', false))
    })

    it('error path dispatches errorRequestTogglePaid', () => {
      const gen = togglePaid({ payload: { id: 'e1', paid: true } })
      gen.next() // advance to call(service.toggleExpensePaid, ...)
      expect(gen.throw(new Error('perm denied')).value).toEqual(
        put(actions.errorRequestTogglePaid('perm denied')),
      )
    })
  })
})
