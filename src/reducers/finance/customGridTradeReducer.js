import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/finance/customGridTradeActions'

const customGridTradeSlice = createSlice({
  name: 'customGridTrade',
  initialState: {
    trades: [],
    loading: false,
    saving: false,
    error: null,
    useIndexedDB: localStorage.getItem('customGridTrade.storage') === 'indexeddb',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.loadRequest, (state) => {
        state.loading = true
      })
      .addCase(actions.loadSuccess, (state, { payload }) => {
        state.trades = payload
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
        const idx = state.trades.findIndex((t) => t.id === payload.id)
        if (idx >= 0) state.trades[idx] = payload
        else state.trades.push(payload)
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
        state.trades = state.trades.filter((t) => t.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.deleteError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
      .addCase(actions.setStorage, (state, { payload }) => {
        state.useIndexedDB = payload
        localStorage.setItem('customGridTrade.storage', payload ? 'indexeddb' : 'firebase')
      })
      .addCase(actions.bulkImportRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.bulkImportSuccess, (state, { payload }) => {
        state.trades = payload
        state.saving = false
      })
      .addCase(actions.bulkImportError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
      .addCase(actions.syncRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.syncSuccess, (state) => {
        state.saving = false
      })
      .addCase(actions.syncError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
      .addCase(actions.deleteAllRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.deleteAllSuccess, (state) => {
        state.trades = []
        state.saving = false
      })
      .addCase(actions.deleteAllError, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
  },
})

export default customGridTradeSlice.reducer
