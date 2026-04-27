import { createSlice } from '@reduxjs/toolkit'
import { crudHandlers, statusHandlers, manualReadHandlers } from './domoticaCurrentHandlers'

const domoticaCurrentSlice = createSlice({
  name: 'domoticaCurrent',
  initialState: {
    data: null,
    battery: null,
    consumption: null,
    manualReadState: 'idle', // 'idle' | 'loading' | 'done' | 'error'
    error: {},
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    crudHandlers(builder)
    statusHandlers(builder)
    manualReadHandlers(builder)
  },
})

export default domoticaCurrentSlice.reducer
