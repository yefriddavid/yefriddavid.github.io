import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/finance/cryptoPurchaseActions'

const cryptoPurchaseSlice = createSlice({
  name: 'cryptoPurchase',
  initialState: {
    purchases: [],
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
        state.purchases = payload
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
        state.purchases.push(payload)
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
        const idx = state.purchases.findIndex((p) => p.id === payload.id)
        if (idx >= 0) state.purchases[idx] = payload
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
        state.purchases = state.purchases.filter((p) => p.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.deleteError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
  },
})

export default cryptoPurchaseSlice.reducer
