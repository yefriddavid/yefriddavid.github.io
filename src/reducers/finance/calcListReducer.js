import { createSlice } from '@reduxjs/toolkit'
import * as a from '../../actions/finance/calcListActions'

const calcListSlice = createSlice({
  name: 'calcList',
  initialState: { lists: [], activeId: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(a.loadRequest, (state) => { state.loading = true })
      .addCase(a.loadSuccess, (state, { payload }) => {
        state.lists = payload
        state.loading = false
        if (payload.length && !payload.find((l) => l.id === state.activeId)) {
          state.activeId = payload[0].id
        }
      })
      .addCase(a.loadError, (state, { payload }) => { state.error = payload; state.loading = false })

      .addCase(a.setActive, (state, { payload }) => { state.activeId = payload })

      .addCase(a.createListSuccess, (state, { payload }) => {
        state.lists.push(payload)
        state.activeId = payload.id
      })

      .addCase(a.deleteListSuccess, (state, { payload }) => {
        state.lists = state.lists.filter((l) => l.id !== payload)
        if (state.activeId === payload) {
          state.activeId = state.lists[0]?.id ?? null
        }
      })

      .addCase(a.updateListSuccess, (state, { payload: { id, name, budget, order } }) => {
        const l = state.lists.find((l) => l.id === id)
        if (!l) return
        l.name = name
        if (budget !== undefined) l.budget = budget
        if (order !== undefined) l.order = order
      })

      .addCase(a.saveRowSuccess, (state, { payload: { listId, row } }) => {
        const list = state.lists.find((l) => l.id === listId)
        if (!list) return
        const idx = list.rows.findIndex((r) => r.id === row.id)
        if (idx >= 0) list.rows[idx] = row
        else list.rows.push(row)
      })

      .addCase(a.deleteRowSuccess, (state, { payload: { listId, rowId } }) => {
        const list = state.lists.find((l) => l.id === listId)
        if (list) list.rows = list.rows.filter((r) => r.id !== rowId)
      })

      .addCase(a.mergeSuccess, (state, { payload }) => {
        state.lists = payload
        if (payload.length && !payload.find((l) => l.id === state.activeId)) {
          state.activeId = payload[0].id
        }
      })

      .addCase(a.importSuccess, (state, { payload }) => {
        state.lists = payload
        state.activeId = payload[0]?.id ?? null
      })
  },
})

export default calcListSlice.reducer
