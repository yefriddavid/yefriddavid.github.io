import { CREATE_PAGO, PAGO_EXITOSO, PAGO_FALLIDO, CARGAR_PAGOS } from './actionTypes'

const initialState = {
  pagos: [],
  cargando: false,
  error: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PAGO:
      return { ...state, cargando: true }
    case PAGO_EXITOSO:
      return { ...state, pagos: [...state.pagos, action.payload], cargando: false }
    case PAGO_FALLIDO:
      return { ...state, error: action.payload, cargando: false }
    case CARGAR_PAGOS:
      // Lógica para cargar los pagos desde la API
      return { ...state, pagos: action.payload }
    default:
      return state
  }
}

export default reducer
