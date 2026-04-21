import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/taxi/vehicleLocationHistoryActions'

export default createCRUDReducer('vehicleLocationHistory', actions, {
  sortKey: 'timestamp',
}).reducer
