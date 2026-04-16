import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/contratos/bankAccountActions'

export default createCRUDReducer('contratoBankAccount', actions, { sortKey: 'bank_name' }).reducer
