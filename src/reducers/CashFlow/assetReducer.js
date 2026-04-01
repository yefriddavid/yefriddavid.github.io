import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/assetActions'

const assetSlice = createSlice({
  name: 'asset',
  initialState: { assets: [], loading: false, saving: false, syncing: false, syncingAll: false, importing: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.loadRequest, (state) => { state.loading = true })
      .addCase(actions.loadSuccess, (state, { payload }) => { state.assets = payload; state.loading = false })
      .addCase(actions.loadError, (state, { payload }) => { state.error = payload; state.loading = false })

      .addCase(actions.saveRequest, (state) => { state.saving = true })
      .addCase(actions.saveSuccess, (state, { payload }) => {
        const idx = state.assets.findIndex((a) => a.id === payload.id)
        if (idx >= 0) state.assets[idx] = payload
        else state.assets.push(payload)
        state.saving = false
      })
      .addCase(actions.saveError, (state, { payload }) => { state.error = payload; state.saving = false })

      .addCase(actions.deleteRequest, (state) => { state.saving = true })
      .addCase(actions.deleteSuccess, (state, { payload }) => {
        state.assets = state.assets.filter((a) => a.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.deleteError, (state, { payload }) => { state.error = payload; state.saving = false })

      .addCase(actions.syncRequest, (state) => { state.syncing = true })
      .addCase(actions.syncSuccess, (state, { payload }) => {
        const idx = state.assets.findIndex((a) => a.id === payload.id)
        if (idx >= 0) state.assets[idx] = payload
        state.syncing = false
      })
      .addCase(actions.syncError, (state, { payload }) => { state.error = payload; state.syncing = false })

      .addCase(actions.syncAllRequest, (state) => { state.syncingAll = true })
      .addCase(actions.syncAllSuccess, (state, { payload }) => {
        payload.forEach(({ id, syncedAt }) => {
          const idx = state.assets.findIndex((a) => a.id === id)
          if (idx >= 0) state.assets[idx].syncedAt = syncedAt
        })
        state.syncingAll = false
      })
      .addCase(actions.syncAllError, (state, { payload }) => { state.error = payload; state.syncingAll = false })

      .addCase(actions.importRequest, (state) => { state.importing = true })
      .addCase(actions.importSuccess, (state, { payload }) => { state.assets = payload; state.importing = false })
      .addCase(actions.importError, (state, { payload }) => { state.error = payload; state.importing = false })
  },
})

export default assetSlice.reducer
