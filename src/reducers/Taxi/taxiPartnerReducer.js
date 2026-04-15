import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/Taxi/taxiPartnerActions'

export default createCRUDReducer('taxiPartner', actions, { sortKey: 'name', beginUpdate: true }).reducer
