import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as accountActions from '../../actions/accountActions'
import * as apiService from '../../services/providers/api/accounts'

// Step-through generator copy (standard redux-saga testing pattern)
function* fetchAccounts({ payload: filters }) {
  try {
    yield put(accountActions.beginRequest())
    const response = yield call(apiService.fetchAccounts, filters)
    if (response.status === 'error') {
      yield put(accountActions.errorRequest(response.message))
    } else {
      yield put(accountActions.successRequest(response))
    }
  } catch (e) {
    yield put(accountActions.errorRequest(e.toString()))
  }
}

describe('accountSagas', () => {
  describe('fetchAccounts', () => {
    it('beginRequest → fetchAccounts(filters) → successRequest on ok response', () => {
      const filters = { month: '2024-03' }
      const response = { status: 'ok', data: { items: [] } }
      const gen = fetchAccounts({ payload: filters })

      expect(gen.next().value).toEqual(put(accountActions.beginRequest()))
      expect(gen.next().value).toEqual(call(apiService.fetchAccounts, filters))
      expect(gen.next(response).value).toEqual(put(accountActions.successRequest(response)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequest when response.status === "error"', () => {
      const filters = { month: '2024-03' }
      const response = { status: 'error', message: 'Unauthorized' }
      const gen = fetchAccounts({ payload: filters })

      gen.next()                   // beginRequest
      gen.next()                   // call fetchAccounts
      expect(gen.next(response).value).toEqual(put(accountActions.errorRequest('Unauthorized')))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequest on thrown exception', () => {
      const gen = fetchAccounts({ payload: {} })
      gen.next()  // beginRequest
      gen.next()  // call fetchAccounts
      const error = new Error('Network error')
      expect(gen.throw(error).value).toEqual(put(accountActions.errorRequest(error.toString())))
    })
  })
})
