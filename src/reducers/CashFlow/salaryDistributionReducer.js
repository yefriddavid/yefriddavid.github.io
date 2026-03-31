import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/salaryDistributionActions'

const DEFAULT_CONFIG = {
  salary: 5000,
  invert: 2000,
  rows: [
    { id: 1, name: 'car', type: 'percent', value: 10 },
    { id: 2, name: 'col', type: 'percent', value: 20 },
    { id: 3, name: 'ocio', type: 'remainder', value: 0 },
  ],
}

const salaryDistributionSlice = createSlice({
  name: 'salaryDistribution',
  initialState: {
    data: null,
    fetching: false,
    saving: false,
    error: {},
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.beginRequestFetch, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.data = payload ?? DEFAULT_CONFIG
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state, { payload }) => {
        state.data = DEFAULT_CONFIG
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.beginRequestSave, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestSave, (state, { payload }) => {
        state.data = payload
        state.saving = false
      })
      .addCase(actions.errorRequestSave, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })
  },
})

export default salaryDistributionSlice.reducer
