import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/Contratos/ownerActions'

export default createCRUDReducer('contratoOwner', actions, { sortKey: 'full_name', writeFlag: 'saving' }).reducer
