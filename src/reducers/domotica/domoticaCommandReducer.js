import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/domotica/domoticaCommandActions'

const domoticaCommandSlice = createSlice({
  name: 'domoticaCommand',
  initialState: {
    commands: {},
    fetching: false,
    updatingIds: {},
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.fetchSuccess, (state, { payload }) => {
        state.commands = payload
        state.fetching = false
      })
      .addCase(actions.fetchError, (state) => {
        state.fetching = false
        state.isError = true
      })
      .addCase(actions.updateRequest, (state, { payload }) => {
        state.updatingIds[payload.id] = true
        state.commands[payload.id] = {
          ...(state.commands[payload.id] ?? { id: payload.id }),
          read: payload.read,
        }
      })
      .addCase(actions.updateSuccess, (state, { payload }) => {
        delete state.updatingIds[payload.id]
      })
      .addCase(actions.updateError, (state, { payload }) => {
        delete state.updatingIds[payload.id]
        if (state.commands[payload.id]) {
          state.commands[payload.id].read = payload.previous
        }
      })
  },
})

export default domoticaCommandSlice.reducer
