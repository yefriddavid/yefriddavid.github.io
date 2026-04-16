import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/taxi/taxiSettlementActions'

export default createCRUDReducer('taxiSettlement', actions, {
  prependOnCreate: true,
  beginUpdate: true,
  beginDelete: true,
}).reducer
