const savedTheme = localStorage.getItem('app-theme') || 'yellow'

const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  appTheme: savedTheme,
}

const uiReducer = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      if (rest.appTheme) localStorage.setItem('app-theme', rest.appTheme)
      return { ...state, ...rest }
    default:
      return state
  }
}

export default uiReducer
