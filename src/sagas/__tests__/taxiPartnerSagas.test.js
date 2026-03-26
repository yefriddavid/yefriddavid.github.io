import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/taxiPartnerActions'
import * as service from '../../services/providers/firebase/CashFlow/taxiPartners'
import { makePartner } from '../../__tests__/factories'

function* fetchPartners() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPartners)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createPartner({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addPartner, payload)
    yield put(actions.successRequestCreate({ id, name: payload.name, percentage: Number(payload.percentage) }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updatePartner({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updatePartner, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deletePartner({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deletePartner, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

describe('taxiPartnerSagas', () => {
  describe('fetchPartners', () => {
    it('begin → getPartners → success', () => {
      const gen = fetchPartners()
      const partners = [makePartner()]
      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getPartners))
      expect(gen.next(partners).value).toEqual(put(actions.successRequestFetch(partners)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestFetch', () => {
      const gen = fetchPartners()
      gen.next(); gen.next()
      expect(gen.throw(new Error('network')).value).toEqual(put(actions.errorRequestFetch('network')))
    })
  })

  describe('createPartner', () => {
    it('converts percentage string to Number', () => {
      const payload = makePartner({ id: undefined, percentage: '40' })
      const gen = createPartner({ payload })
      gen.next()           // beginRequestCreate
      gen.next()           // call addPartner
      const { payload: dispatched } = gen.next('new-id').value.payload.action
      expect(dispatched.percentage).toBe(40)
      expect(typeof dispatched.percentage).toBe('number')
    })

    it('only includes id, name, percentage in the dispatched payload (no extra fields)', () => {
      const payload = { id: undefined, name: 'Socio X', percentage: '30' }
      const gen = createPartner({ payload })
      gen.next(); gen.next()
      const { payload: dispatched } = gen.next('p-id').value.payload.action
      expect(Object.keys(dispatched)).toEqual(['id', 'name', 'percentage'])
    })

    it('error path dispatches errorRequestCreate', () => {
      const gen = createPartner({ payload: makePartner() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('forbidden')).value).toEqual(put(actions.errorRequestCreate('forbidden')))
    })
  })

  describe('updatePartner', () => {
    it('begin → updatePartner(id, payload) → success', () => {
      const payload = makePartner()
      const gen = updatePartner({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
      expect(gen.next().value).toEqual(call(service.updatePartner, payload.id, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestUpdate(payload)))
    })
  })

  describe('deletePartner', () => {
    it('begin → deletePartner(id) → success', () => {
      const payload = makePartner()
      const gen = deletePartner({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deletePartner, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
    })

    it('error path dispatches errorRequestDelete', () => {
      const gen = deletePartner({ payload: makePartner() })
      gen.next(); gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.errorRequestDelete('not found')))
    })
  })
})
