import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/finance/scenes3dActions'

const scenes3dSlice = createSlice({
  name: 'financeScenes3d',
  initialState: {
    list: null,
    current: null,
    fetching: false,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.clearScene, (state) => { state.current = null })

      .addCase(actions.beginRequestFetch, (state) => { state.fetching = true; state.error = null })
      .addCase(actions.successRequestFetch, (state, { payload }) => { state.list = payload; state.fetching = false })
      .addCase(actions.errorRequestFetch, (state, { payload }) => { state.error = payload; state.fetching = false })

      .addCase(actions.beginRequestLoad, (state) => { state.loading = true; state.error = null })
      .addCase(actions.successRequestLoad, (state, { payload }) => { state.current = payload; state.loading = false })
      .addCase(actions.errorRequestLoad, (state, { payload }) => { state.error = payload; state.loading = false })

      .addCase(actions.beginRequestCreate, (state) => { state.saving = true })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.list = state.list
          ? [...state.list, payload].sort((a, b) => a.name.localeCompare(b.name))
          : [payload]
        state.current = payload
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => { state.error = payload; state.saving = false })

      .addCase(actions.beginRequestUpdate, (state) => { state.saving = true })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        state.list = state.list
          ? state.list.map((r) => (r.id === payload.id ? { ...r, ...payload } : r))
          : state.list
        state.current = { ...state.current, ...payload }
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => { state.error = payload; state.saving = false })

      .addCase(actions.beginRequestDelete, (state) => { state.saving = true })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        state.list = state.list ? state.list.filter((r) => r.id !== payload.id) : state.list
        if (state.current?.id === payload.id) state.current = null
        state.saving = false
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => { state.error = payload; state.saving = false })
  },
})

export default scenes3dSlice.reducer
