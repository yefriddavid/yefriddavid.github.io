import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/pageVisitActions'

export default createCRUDReducer('pageVisit', actions, { beginDelete: true }).reducer
