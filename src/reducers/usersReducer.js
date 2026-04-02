import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../actions/usersActions'

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    data: null,
    error: {},
    fetching: false,
    isError: false,
    sessions: {}, // { [username]: { data: [], fetching, error } }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.beginRequestFetch, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.data = payload
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.beginRequestCreate, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.data = state.data
          ? [...state.data, payload].sort((a, b) => a.name.localeCompare(b.name))
          : [payload]
        state.fetching = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        if (state.data) {
          state.data = state.data
            .map((r) => (r.username === payload.username ? { ...r, ...payload } : r))
            .sort((a, b) => a.name.localeCompare(b.name))
        }
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })

      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) state.data = state.data.filter((r) => r.username !== payload.username)
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })

      .addCase(actions.fetchSessionsRequest, (state, { payload: username }) => {
        state.sessions[username] = { data: [], fetching: true, error: null }
      })
      .addCase(actions.fetchSessionsSuccess, (state, { payload: { username, sessions } }) => {
        state.sessions[username] = { data: sessions, fetching: false, error: null }
      })
      .addCase(actions.fetchSessionsError, (state, { payload: { username, error } }) => {
        state.sessions[username] = { data: [], fetching: false, error }
      })

      .addCase(actions.deleteSessionSuccess, (state, { payload: { username, sessionId } }) => {
        if (state.sessions[username]) {
          state.sessions[username].data = state.sessions[username].data.filter(
            (s) => s.sessionId !== sessionId,
          )
        }
      })
  },
})

export default usersSlice.reducer
