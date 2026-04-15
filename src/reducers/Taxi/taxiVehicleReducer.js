import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/Taxi/taxiVehicleActions'

export default createCRUDReducer('taxiVehicle', actions, {
  sortKey: 'plate',
  extraCases: (builder) => {
    builder
      .addCase(actions.successRequestUpdateRestrictions, (s, { payload }) => {
        if (s.data) {
          s.data = s.data.map((r) => r.id === payload.id ? { ...r, restrictions: payload.restrictions } : r)
        }
      })
      .addCase(actions.errorRequestUpdateRestrictions, (s, { payload }) => {
        s.error = payload; s.isError = true
      })
  },
}).reducer
