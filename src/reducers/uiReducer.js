import { createSlice } from '@reduxjs/toolkit'
import { uiStorage } from 'src/utils/storage'

const savedTheme = uiStorage.getTheme()
const savedSidebarShow = uiStorage.getSidebarShow()
const savedHeaderShow = uiStorage.getHeaderShow()

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
      if (payload.appTheme) uiStorage.setTheme(payload.appTheme)
      if (payload.sidebarShow !== undefined) uiStorage.setSidebarShow(payload.sidebarShow)
      if (payload.headerShow !== undefined) uiStorage.setHeaderShow(payload.headerShow)
      return { ...state, ...payload }
    },
  },
})

export const { setUi } = uiSlice.actions
export default uiSlice.reducer
