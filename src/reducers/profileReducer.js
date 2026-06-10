import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../actions/authActions'

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null, // { username, name, role, avatar, email, active }
    loading: false,
    error: null,
    pwChanging: false,
    pwSuccess: false,
    pwError: null, // { code, message } | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchProfile, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(actions.fetchProfileSuccess, (state, { payload }) => {
        state.data = payload
        state.loading = false
      })
      .addCase(actions.fetchProfileError, (state, { payload }) => {
        state.error = payload
        state.loading = false
      })

      .addCase(actions.updateProfileSuccess, (state, { payload }) => {
        if (state.data) state.data = { ...state.data, ...payload }
      })
      .addCase(actions.updateProfileError, (state, { payload }) => {
        state.error = payload
      })

      .addCase(actions.updateAvatarSuccess, (state, { payload }) => {
        if (state.data) state.data = { ...state.data, avatar: payload }
      })
      .addCase(actions.updateAvatarError, (state, { payload }) => {
        state.error = payload
      })

      .addCase(actions.clearProfile, (state) => {
        state.data = null
        state.error = null
      })

      .addCase(actions.changePasswordRequest, (state) => {
        state.pwChanging = true
        state.pwSuccess = false
        state.pwError = null
      })
      .addCase(actions.changePasswordSuccess, (state) => {
        state.pwChanging = false
        state.pwSuccess = true
        state.pwError = null
      })
      .addCase(actions.changePasswordError, (state, { payload }) => {
        state.pwChanging = false
        state.pwSuccess = false
        state.pwError = payload
      })
      .addCase(actions.changePasswordReset, (state) => {
        state.pwChanging = false
        state.pwSuccess = false
        state.pwError = null
      })
  },
})

export default profileSlice.reducer
