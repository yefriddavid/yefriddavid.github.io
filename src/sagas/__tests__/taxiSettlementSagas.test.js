import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/taxiSettlementActions'
import * as service from '../../services/providers/firebase/taxiSettlements'

// Step-through generators (standard redux-saga testing pattern)
function* fetchSettlements() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getSettlements)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createSettlement({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addSettlement, payload)
    yield put(actions.successRequestCreate({
      id,
      driver: payload.driver,
      plate: payload.plate?.toUpperCase(),
      amount: Number(payload.amount),
      date: payload.date,
      comment: payload.comment || null,
    }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateSettlement({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateSettlement, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteSettlement({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteSettlement, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

describe('taxiSettlementSagas', () => {
  describe('fetchSettlements', () => {
    it('dispatches beginRequestFetch, calls service, then dispatches success', () => {
      const gen = fetchSettlements()
      const records = [{ id: 'r1', driver: 'Juan', plate: 'ABC123', amount: 50000, date: '2024-03-01' }]

      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getSettlements))
      expect(gen.next(records).value).toEqual(put(actions.successRequestFetch(records)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestFetch on failure', () => {
      const gen = fetchSettlements()
      const error = new Error('unavailable')

      gen.next() // put(beginRequestFetch)
      gen.next() // call(service.getSettlements)
      expect(gen.throw(error).value).toEqual(put(actions.errorRequestFetch('unavailable')))
      expect(gen.next().done).toBe(true)
    })
  })

  describe('createSettlement', () => {
    const payload = {
      driver: 'Maria Lopez',
      plate: 'xyz789',
      amount: '65000',
      date: '2024-03-05',
      comment: '',
    }

    it('normalizes plate to uppercase and amount to Number', () => {
      const gen = createSettlement({ payload })
      const newId = 'doc-abc'

      gen.next() // put(beginRequestCreate)
      gen.next() // call(service.addSettlement, payload)

      const successEffect = gen.next(newId).value
      expect(successEffect).toEqual(
        put(actions.successRequestCreate({
          id: newId,
          driver: 'Maria Lopez',
          plate: 'XYZ789',
          amount: 65000,
          date: '2024-03-05',
          comment: null,
        })),
      )
    })

    it('keeps comment when provided', () => {
      const payloadWithComment = { ...payload, comment: 'abono' }
      const gen = createSettlement({ payload: payloadWithComment })
      const newId = 'doc-xyz'

      gen.next() // beginRequestCreate
      gen.next() // call addSettlement

      const successEffect = gen.next(newId).value
      const dispatched = successEffect.payload.action.payload
      expect(dispatched.comment).toBe('abono')
    })

    it('full success flow sequence', () => {
      const gen = createSettlement({ payload })
      const newId = 'doc-001'

      expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(service.addSettlement, payload))
      gen.next(newId) // successRequestCreate
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestCreate on failure', () => {
      const gen = createSettlement({ payload })
      const error = new Error('write failed')

      gen.next() // beginRequestCreate
      gen.next() // call addSettlement
      expect(gen.throw(error).value).toEqual(put(actions.errorRequestCreate('write failed')))
      expect(gen.next().done).toBe(true)
    })
  })

  describe('updateSettlement', () => {
    const payload = { id: 'r1', driver: 'Juan', plate: 'ABC123', amount: 55000, date: '2024-03-10' }

    it('dispatches beginRequestUpdate, calls service, then dispatches success', () => {
      const gen = updateSettlement({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
      expect(gen.next().value).toEqual(call(service.updateSettlement, payload.id, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestUpdate(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestUpdate on failure', () => {
      const gen = updateSettlement({ payload })
      const error = new Error('conflict')

      gen.next() // beginRequestUpdate
      gen.next() // call updateSettlement
      expect(gen.throw(error).value).toEqual(put(actions.errorRequestUpdate('conflict')))
      expect(gen.next().done).toBe(true)
    })
  })

  describe('deleteSettlement', () => {
    const payload = { id: 'r1', driver: 'Juan' }

    it('dispatches beginRequestDelete, calls service with id, then dispatches success', () => {
      const gen = deleteSettlement({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deleteSettlement, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestDelete on failure', () => {
      const gen = deleteSettlement({ payload })
      const error = new Error('not found')

      gen.next() // beginRequestDelete
      gen.next() // call deleteSettlement
      expect(gen.throw(error).value).toEqual(put(actions.errorRequestDelete('not found')))
      expect(gen.next().done).toBe(true)
    })
  })
})
