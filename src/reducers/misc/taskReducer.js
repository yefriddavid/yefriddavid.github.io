import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/taskActions'

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    data: [],
    fetching: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (s) => { s.fetching = true })
      .addCase(actions.successRequestFetch, (s, { payload }) => {
        s.data = payload ?? []
        s.fetching = false
      })
      .addCase(actions.errorRequestFetch, (s, { payload }) => {
        s.error = payload
        s.fetching = false
      })
      .addCase(actions.saveRequest, (s) => { s.saving = true })
      .addCase(actions.successRequestSave, (s, { payload }) => {
        const idx = s.data.findIndex((t) => t.id === payload.id)
        if (idx >= 0) s.data[idx] = payload
        else s.data.unshift(payload)
        s.saving = false
      })
      .addCase(actions.errorRequestSave, (s, { payload }) => {
        s.error = payload
        s.saving = false
      })
      .addCase(actions.successRequestDelete, (s, { payload }) => {
        s.data = s.data.filter((t) => t.id !== payload)
      })
      .addCase(actions.syncPendingSuccess, (s, { payload }) => {
        payload.forEach((synced) => {
          const idx = s.data.findIndex((t) => t.id === synced.id)
          if (idx >= 0) s.data[idx] = synced
        })
      })
  },
})

export default taskSlice.reducer
