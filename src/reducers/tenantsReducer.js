import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../actions/tenantsActions'

export default createCRUDReducer('tenants', actions, {
  sortKey: 'name',
  idKey: 'id',
}).reducer
