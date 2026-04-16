import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/contratos/propertyActions'

export default createCRUDReducer('contratoProperty', actions, { sortKey: 'alias' }).reducer
