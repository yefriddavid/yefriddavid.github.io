import { createSlice } from '@reduxjs/toolkit'

const programHookSlice = createSlice({
  name: 'programHook',
  initialState: { pending: [] },
  reducers: {
    triggerHook: (state, { payload }) => {
      state.pending.push({ id: Date.now(), ...payload })
    },
    resolveHook: (state, { payload: id }) => {
      state.pending = state.pending.filter((h) => h.id !== id)
    },
  },
})

export const { triggerHook, resolveHook } = programHookSlice.actions
export default programHookSlice.reducer
