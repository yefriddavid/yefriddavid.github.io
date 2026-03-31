import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/myProjectActions'

const myProjectSlice = createSlice({
  name: 'myProject',
  initialState: {
    projects: [],
    loading: false,
    saving: false,
    syncing: false,
    syncingAll: false,
    isError: false,
    errorMessage: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.loadRequest, (state) => { state.loading = true; state.isError = false })
      .addCase(actions.loadSuccess, (state, { payload }) => {
        state.projects = payload
        state.loading = false
      })
      .addCase(actions.loadError, (state, { payload }) => {
        state.loading = false; state.isError = true; state.errorMessage = payload
      })

      .addCase(actions.saveRequest, (state) => { state.saving = true })
      .addCase(actions.saveSuccess, (state, { payload }) => {
        const idx = state.projects.findIndex((p) => p.id === payload.id)
        if (idx >= 0) state.projects[idx] = payload
        else state.projects = [...state.projects, payload]
        state.saving = false
      })
      .addCase(actions.saveError, (state, { payload }) => {
        state.saving = false; state.isError = true; state.errorMessage = payload
      })

      .addCase(actions.deleteRequest, (state) => { state.saving = true })
      .addCase(actions.deleteSuccess, (state, { payload }) => {
        state.projects = state.projects.filter((p) => p.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.deleteError, (state, { payload }) => {
        state.saving = false; state.isError = true; state.errorMessage = payload
      })

      .addCase(actions.syncRequest, (state) => { state.syncing = true })
      .addCase(actions.syncSuccess, (state, { payload }) => {
        const idx = state.projects.findIndex((p) => p.id === payload.id)
        if (idx >= 0) state.projects[idx] = { ...state.projects[idx], syncedAt: payload.syncedAt }
        state.syncing = false
      })
      .addCase(actions.syncError, (state, { payload }) => {
        state.syncing = false; state.isError = true; state.errorMessage = payload
      })

      .addCase(actions.syncAllRequest, (state) => { state.syncingAll = true })
      .addCase(actions.syncAllSuccess, (state, { payload }) => {
        payload.forEach(({ id, syncedAt }) => {
          const idx = state.projects.findIndex((p) => p.id === id)
          if (idx >= 0) state.projects[idx] = { ...state.projects[idx], syncedAt }
        })
        state.syncingAll = false
      })
      .addCase(actions.syncAllError, (state, { payload }) => {
        state.syncingAll = false; state.isError = true; state.errorMessage = payload
      })
  },
})

export default myProjectSlice.reducer
