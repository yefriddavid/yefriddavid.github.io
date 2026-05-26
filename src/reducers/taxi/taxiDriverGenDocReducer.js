import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/taxi/taxiDriverGenDocActions'

export default createCRUDReducer('taxiDriverGenDoc', actions).reducer
