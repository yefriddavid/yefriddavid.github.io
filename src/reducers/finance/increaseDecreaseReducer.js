import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/finance/increaseDecreaseActions'

const increaseDecreaseSlice = createSlice({
  name: 'increaseDecrease',
  initialState: {
    entries: [],
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
        state.entries = payload
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
        state.entries.push(payload)
        state.saving = false
      })
      .addCase(actions.saveError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
      .addCase(actions.deleteRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.deleteSuccess, (state, { payload }) => {
        state.entries = state.entries.filter((e) => e.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.deleteError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
  },
})

export default increaseDecreaseSlice.reducer
