import { describe, it, expect } from 'vitest'
import reducer from '../contractReducer'
import * as actions from '../../../actions/contratos/contractActions'

describe('contractReducer', () => {
  const initialState = {
    list: null,
    current: null,
    error: {},
    fetching: false,
    loading: false,
    saving: false,
    isError: false,
  }

  it('should handle loadRequest', () => {
    const state = reducer(initialState, actions.loadRequest({ id: '1' }))
    expect(state.loading).toBe(true)
    expect(state.isError).toBe(false)
  })

  it('should handle successRequestLoad', () => {
    const mockContract = { id: '1', name: 'Contract 1' }
    const state = reducer(initialState, actions.successRequestLoad(mockContract))
    expect(state.loading).toBe(false)
    expect(state.current).toEqual(mockContract)
  })

  it('should handle errorRequestLoad', () => {
    const error = 'Failed to load'
    const state = reducer(initialState, actions.errorRequestLoad(error))
    expect(state.loading).toBe(false)
    expect(state.isError).toBe(true)
    expect(state.error).toBe(error)
  })
})
