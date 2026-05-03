const savedTheme = localStorage.getItem('app-theme') || 'yellow'
const savedSidebarShow = localStorage.getItem('sidebar-show')
const savedHeaderShow = localStorage.getItem('header-show')

const initialState = {
  sidebarShow: savedSidebarShow !== null ? savedSidebarShow === 'true' : true,
  sidebarUnfoldable: false,
  headerShow: savedHeaderShow !== null ? savedHeaderShow === 'true' : true,
  appTheme: savedTheme,
}

const uiReducer = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      if (rest.appTheme) localStorage.setItem('app-theme', rest.appTheme)
      if (rest.sidebarShow !== undefined) localStorage.setItem('sidebar-show', rest.sidebarShow)
      if (rest.headerShow !== undefined) localStorage.setItem('header-show', rest.headerShow)
      return { ...state, ...rest }
    default:
      return state
  }
}

export default uiReducer
