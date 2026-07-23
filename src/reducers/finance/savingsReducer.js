import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/finance/savingsActions'

const savingsSlice = createSlice({
  name: 'savings',
  initialState: {
    savings: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.loadRequest, (state) => {
        state.loading = true
      })
      .addCase(actions.loadSuccess, (state, { payload }) => {
        state.savings = payload
        state.loading = false
      })
      .addCase(actions.loadError, (state, { payload }) => {
        state.error = payload
        state.loading = false
      })
      .addCase(actions.saveRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.saveSuccess, (state, { payload }) => {
        state.savings.push(payload)
        state.saving = false
      })
      .addCase(actions.saveError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
      .addCase(actions.updateRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.updateSuccess, (state, { payload }) => {
        const idx = state.savings.findIndex((s) => s.id === payload.id)
        if (idx >= 0) state.savings[idx] = payload
        state.saving = false
      })
      .addCase(actions.updateError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
      .addCase(actions.deleteRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.deleteSuccess, (state, { payload }) => {
        state.savings = state.savings.filter((s) => s.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.deleteError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
  },
})

export default savingsSlice.reducer
