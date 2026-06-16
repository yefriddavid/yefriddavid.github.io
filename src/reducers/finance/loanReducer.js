import { createSlice } from '@reduxjs/toolkit'
import * as a from '../../actions/finance/loanActions'

const loanSlice = createSlice({
  name: 'loan',
  initialState: { records: [], loading: false, saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(a.loadRequest, (state) => {
        state.loading = true
      })
      .addCase(a.loadSuccess, (state, { payload }) => {
        state.records = payload
        state.loading = false
      })
      .addCase(a.loadError, (state, { payload }) => {
        state.error = payload
        state.loading = false
      })

      .addCase(a.saveRequest, (state) => {
        state.saving = true
      })
      .addCase(a.saveSuccess, (state, { payload }) => {
        state.saving = false
        const idx = state.records.findIndex((r) => r.id === payload.id)
        if (idx >= 0) state.records[idx] = payload
        else state.records.unshift(payload)
      })
      .addCase(a.saveError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })

      .addCase(a.deleteSuccess, (state, { payload: id }) => {
        state.records = state.records.filter((r) => r.id !== id)
      })
  },
})

export default loanSlice.reducer
