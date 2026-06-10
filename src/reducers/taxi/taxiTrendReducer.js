import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/taxi/taxiTrendActions'

const taxiTrendSlice = createSlice({
  name: 'taxiTrend',
  initialState: { settlements: null, expenses: null, periodKey: null, fetching: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (s) => {
        s.fetching = true
      })
      .addCase(actions.beginRequestFetch, (s) => {
        s.fetching = true
      })
      .addCase(actions.successRequestFetch, (s, { payload }) => {
        s.settlements = payload.settlements
        s.expenses = payload.expenses
        s.periodKey = payload.periodKey
        s.fetching = false
      })
      .addCase(actions.errorRequestFetch, (s) => {
        s.fetching = false
      })
      .addCase(actions.clearRequest, (s) => {
        s.settlements = null
        s.expenses = null
        s.periodKey = null
        s.fetching = false
      })
  },
})

export default taxiTrendSlice.reducer
