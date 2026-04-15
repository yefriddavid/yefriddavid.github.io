import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/Contratos/bankAccountActions'

export default createCRUDReducer('contratoBankAccount', actions, { sortKey: 'bank_name' }).reducer
