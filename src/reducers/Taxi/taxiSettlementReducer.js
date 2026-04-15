import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/Taxi/taxiSettlementActions'

export default createCRUDReducer('taxiSettlement', actions, { prependOnCreate: true, beginUpdate: true, beginDelete: true }).reducer
