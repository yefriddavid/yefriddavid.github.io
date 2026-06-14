import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/misc/noteActions'

export default createCRUDReducer('note', actions, {
  writeFlag: 'saving',
  prependOnCreate: true,
  beginDelete: true,
}).reducer
