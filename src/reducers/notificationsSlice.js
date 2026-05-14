import { createSlice } from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {
    push: (state, { payload }) => {
      state.push({ id: Date.now() + Math.random(), ...payload })
    },
    dismiss: (state, { payload }) => state.filter((n) => n.id !== payload),
  },
})

export const { push, dismiss } = notificationsSlice.actions
export default notificationsSlice.reducer
