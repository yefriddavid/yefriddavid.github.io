import { createSlice } from '@reduxjs/toolkit'
import {
  fetchRequest,
  beginRequestFetch,
  successRequestFetch,
  createRequest,
  beginRequestCreate,
  successRequestCreate,
  errorRequestCreate,
} from '../actions/paymentActions'

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    data: null,
    error: {},
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequest, (state, { payload }) => {
        state.filters = payload
      })
      .addCase(beginRequestFetch, (state) => {
        state.fetching = true
      })
      .addCase(successRequestFetch, (state, { payload }) => {
        state.data = payload
        state.fetching = false
      })
      .addCase(createRequest, (state) => {
        state.fetching = true
      })
      .addCase(beginRequestCreate, (state) => {
        state.fetching = true
      })
      .addCase(successRequestCreate, (state) => {
        state.fetching = false
      })
      .addCase(errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.data = []
        state.fetching = false
        state.isError = true
      })
  },
})

export default paymentSlice.reducer
