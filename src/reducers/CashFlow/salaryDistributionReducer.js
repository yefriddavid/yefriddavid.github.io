import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/salaryDistributionActions'

const DEFAULT_DISTRIBUTIONS = [
  {
    id: 'default',
    name: 'Principal',
    salary: 5000,
    invert: 2000,
    invertTarget: '',
    rows: [
      { id: 1, name: 'car', type: 'percent', value: 10 },
      { id: 2, name: 'col', type: 'percent', value: 20 },
      { id: 3, name: 'ocio', type: 'remainder', value: 0 },
    ],
  },
]

function migrate(payload) {
  if (!payload) return DEFAULT_DISTRIBUTIONS
  if (Array.isArray(payload)) return payload
  // Old single-config format — wrap in array
  return [{ id: 'default', name: 'Principal', ...payload }]
}

const salaryDistributionSlice = createSlice({
  name: 'salaryDistribution',
  initialState: {
    data: null,
    fetching: false,
    saving: false,
    syncing: false,
    importing: false,
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
        state.data = migrate(payload)
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state, { payload }) => {
        state.data = DEFAULT_DISTRIBUTIONS
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

      .addCase(actions.syncRequest, (state) => { state.syncing = true })
      .addCase(actions.syncSuccess, (state, { payload }) => {
        state.data = payload
        state.syncing = false
      })
      .addCase(actions.syncError, (state, { payload }) => {
        state.error = payload
        state.syncing = false
        state.isError = true
      })

      .addCase(actions.importRequest, (state) => { state.importing = true })
      .addCase(actions.importSuccess, (state, { payload }) => {
        state.data = payload
        state.importing = false
      })
      .addCase(actions.importError, (state, { payload }) => {
        state.error = payload
        state.importing = false
        state.isError = true
      })
  },
})

export default salaryDistributionSlice.reducer
