const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
}

const uiReducer = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

export default uiReducer
