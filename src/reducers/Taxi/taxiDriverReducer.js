import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/Taxi/taxiDriverActions'

export default createCRUDReducer('taxiDriver', actions, { sortKey: 'name' }).reducer
