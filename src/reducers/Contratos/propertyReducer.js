import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/Contratos/propertyActions'

export default createCRUDReducer('contratoProperty', actions, { sortKey: 'alias' }).reducer
