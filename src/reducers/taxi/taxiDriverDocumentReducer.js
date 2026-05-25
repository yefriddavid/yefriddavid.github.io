import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/taxi/taxiDriverDocumentActions'

export default createCRUDReducer('taxiDriverDocument', actions, { sortKey: 'name', beginUpdate: true })
  .reducer
