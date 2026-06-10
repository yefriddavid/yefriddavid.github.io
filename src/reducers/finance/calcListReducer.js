import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/finance/calcListActions'

const calcListSlice = createSlice({
  name: 'calcList',
  initialState: { rows: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.loadRequest, (state) => {
        state.loading = true
      })
      .addCase(actions.loadSuccess, (state, { payload }) => {
        state.rows = payload
        state.loading = false
      })
      .addCase(actions.loadError, (state, { payload }) => {
        state.error = payload
        state.loading = false
      })
      .addCase(actions.saveSuccess, (state, { payload }) => {
        const idx = state.rows.findIndex((r) => r.id === payload.id)
        if (idx >= 0) state.rows[idx] = payload
        else state.rows.push(payload)
      })
      .addCase(actions.deleteSuccess, (state, { payload }) => {
        state.rows = state.rows.filter((r) => r.id !== payload)
      })
  },
})

export default calcListSlice.reducer
