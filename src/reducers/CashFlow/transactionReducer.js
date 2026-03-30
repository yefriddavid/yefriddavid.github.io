import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/transactionActions'

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: { data: null, fetching: false, saving: false, error: {}, isError: false, importing: false, importProgress: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.beginRequestFetch, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.data = payload
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.beginRequestCreate, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.data = state.data ? [payload, ...state.data] : [payload]
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.beginRequestUpdate, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.map((r) => (r.id === payload.id ? { ...r, ...payload } : r))
        }
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) state.data = state.data.filter((r) => r.id !== payload.id)
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })

      .addCase(actions.importRequest, (state) => {
        state.importing = true
        state.importProgress = 0
      })
      .addCase(actions.importProgressUpdate, (state, { payload }) => {
        state.importProgress = payload
      })
      .addCase(actions.importComplete, (state, { payload }) => {
        state.importing = false
        state.importProgress = 100
        state.data = payload
      })
      .addCase(actions.importError, (state, { payload }) => {
        state.importing = false
        state.error = payload
        state.isError = true
      })
  },
})

export default transactionSlice.reducer
