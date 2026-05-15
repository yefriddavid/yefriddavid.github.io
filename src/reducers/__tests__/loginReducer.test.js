import { describe, it, expect } from 'vitest'
import reducer from '../loginReducer'
import { beginLoginRequest, successRequest, errorRequest } from '../../actions/authActions'

const initial = { error: {}, fetching: false, isError: false }

describe('loginReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  it('beginLoginRequest sets fetching', () => {
    expect(reducer(initial, beginLoginRequest()).fetching).toBe(true)
  })

  it('successRequest clears fetching', () => {
    const s = reducer({ ...initial, fetching: true }, successRequest())
    expect(s.fetching).toBe(false)
  })

  it('errorRequest stores error, clears fetching, and sets isError', () => {
    const err = { message: 'Invalid credentials' }
    const s = reducer({ ...initial, fetching: true }, errorRequest(err))
    expect(s.fetching).toBe(false)
    expect(s.isError).toBe(true)
    expect(s.error).toEqual(err)
  })

  it('a new error replaces the previous one', () => {
    const s1 = reducer(initial, errorRequest({ message: 'Error 1' }))
    const s2 = reducer(s1, errorRequest({ message: 'Error 2' }))
    expect(s2.error.message).toBe('Error 2')
  })

  it('subsequent login attempt after error clears nothing except fetching flag', () => {
    const errState = reducer(initial, errorRequest({ message: 'Bad creds' }))
    const s = reducer(errState, beginLoginRequest())
    expect(s.fetching).toBe(true)
    expect(s.isError).toBe(true)
  })
})
