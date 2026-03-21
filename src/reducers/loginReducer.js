import { createSlice } from '@reduxjs/toolkit'
import { errorRequest, beginLoginRequest, successRequest } from '../actions/authActions'

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    error: {},
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(beginLoginRequest, (state) => {
        state.fetching = true
      })
      .addCase(successRequest, (state) => {
        state.fetching = false
      })
      .addCase(errorRequest, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })
  },
})

export default loginSlice.reducer
