import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/auditLogActions'

export default createCRUDReducer('auditLog', actions, { beginDelete: true }).reducer
