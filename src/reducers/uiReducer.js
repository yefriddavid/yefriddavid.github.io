import { createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('app-theme') || 'yellow'
const savedSidebarShow = localStorage.getItem('sidebar-show')
const savedHeaderShow = localStorage.getItem('header-show')

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarShow: savedSidebarShow !== null ? savedSidebarShow === 'true' : true,
    sidebarUnfoldable: false,
    headerShow: savedHeaderShow !== null ? savedHeaderShow === 'true' : true,
    appTheme: savedTheme,
  },
  reducers: {
    setUi: (state, { payload }) => {
      if (payload.appTheme) localStorage.setItem('app-theme', payload.appTheme)
      if (payload.sidebarShow !== undefined)
        localStorage.setItem('sidebar-show', payload.sidebarShow)
      if (payload.headerShow !== undefined) localStorage.setItem('header-show', payload.headerShow)
      return { ...state, ...payload }
    },
  },
})

export const { setUi } = uiSlice.actions
export default uiSlice.reducer
