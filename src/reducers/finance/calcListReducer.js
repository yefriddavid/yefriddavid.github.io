import { createSlice } from '@reduxjs/toolkit'
import * as a from '../../actions/finance/calcListActions'

const sortedFirst = (items) =>
  [...items].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))[0]?.id ?? null

const calcListSlice = createSlice({
  name: 'calcList',
  initialState: { groups: [], activeGroupId: null, activeListId: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(a.loadRequest, (state) => { state.loading = true })
      .addCase(a.loadSuccess, (state, { payload }) => {
        state.groups  = payload
        state.loading = false
        if (!payload.length) return
        if (!payload.find((g) => g.id === state.activeGroupId)) {
          state.activeGroupId = payload[0].id
        }
        const ag = payload.find((g) => g.id === state.activeGroupId)
        if (ag && !ag.items.find((l) => l.id === state.activeListId)) {
          state.activeListId = sortedFirst(ag.items)
        }
      })
      .addCase(a.loadError, (state, { payload }) => { state.error = payload; state.loading = false })

      .addCase(a.setActiveGroup, (state, { payload }) => {
        state.activeGroupId = payload
        const group = state.groups.find((g) => g.id === payload)
        state.activeListId = sortedFirst(group?.items ?? [])
      })
      .addCase(a.setActive, (state, { payload }) => { state.activeListId = payload })

      // Groups
      .addCase(a.createGroupSuccess, (state, { payload }) => {
        state.groups.push(payload)
        state.activeGroupId = payload.id
        state.activeListId  = null
      })
      .addCase(a.cloneGroupSuccess, (state, { payload }) => {
        state.groups.push(payload)
        state.activeGroupId = payload.id
        state.activeListId  = sortedFirst(payload.items)
      })
      .addCase(a.deleteGroupSuccess, (state, { payload: id }) => {
        state.groups = state.groups.filter((g) => g.id !== id)
        if (state.activeGroupId === id) {
          state.activeGroupId = state.groups[0]?.id ?? null
          state.activeListId  = sortedFirst(state.groups[0]?.items ?? [])
        }
      })
      .addCase(a.updateGroupSuccess, (state, { payload: { id, name, order } }) => {
        const g = state.groups.find((g) => g.id === id)
        if (!g) return
        g.name = name
        if (order !== undefined) g.order = order
      })

      // Lists
      .addCase(a.createListSuccess, (state, { payload: { groupId, list } }) => {
        const group = state.groups.find((g) => g.id === groupId)
        if (!group) return
        group.items.push(list)
        state.activeListId = list.id
      })
      .addCase(a.deleteListSuccess, (state, { payload: { groupId, listId } }) => {
        const group = state.groups.find((g) => g.id === groupId)
        if (!group) return
        group.items = group.items.filter((l) => l.id !== listId)
        if (state.activeListId === listId) {
          state.activeListId = sortedFirst(group.items)
        }
      })
      .addCase(a.updateListSuccess, (state, { payload: { groupId, id, name, budget, order } }) => {
        const group = state.groups.find((g) => g.id === groupId)
        if (!group) return
        const l = group.items.find((l) => l.id === id)
        if (!l) return
        l.name = name
        if (budget !== undefined) l.budget = budget
        if (order !== undefined) l.order = order
      })

      // Rows
      .addCase(a.saveRowSuccess, (state, { payload: { groupId, listId, row } }) => {
        const list = state.groups.find((g) => g.id === groupId)?.items.find((l) => l.id === listId)
        if (!list) return
        const idx = list.rows.findIndex((r) => r.id === row.id)
        if (idx >= 0) list.rows[idx] = row
        else list.rows.push(row)
      })
      .addCase(a.deleteRowSuccess, (state, { payload: { groupId, listId, rowId } }) => {
        const list = state.groups.find((g) => g.id === groupId)?.items.find((l) => l.id === listId)
        if (list) list.rows = list.rows.filter((r) => r.id !== rowId)
      })
      .addCase(a.reorderRowsSuccess, (state, { payload: { groupId, listId, rows } }) => {
        const list = state.groups.find((g) => g.id === groupId)?.items.find((l) => l.id === listId)
        if (list) list.rows = rows
      })

      // Sync / import
      .addCase(a.mergeSuccess, (state, { payload }) => {
        state.groups = payload
        if (payload.length && !payload.find((g) => g.id === state.activeGroupId)) {
          state.activeGroupId = payload[0].id
          state.activeListId  = sortedFirst(payload[0]?.items ?? [])
        }
      })
      .addCase(a.importSuccess, (state, { payload }) => {
        state.groups       = payload
        state.activeGroupId = payload[0]?.id ?? null
        state.activeListId  = sortedFirst(payload[0]?.items ?? [])
      })
  },
})

export default calcListSlice.reducer
