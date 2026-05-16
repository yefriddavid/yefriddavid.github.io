import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/errorLogActions'

export default createCRUDReducer('errorLog', actions).reducer
