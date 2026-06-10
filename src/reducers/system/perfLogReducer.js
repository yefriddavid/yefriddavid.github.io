import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/perfLogActions'

export default createCRUDReducer('perfLog', actions).reducer
