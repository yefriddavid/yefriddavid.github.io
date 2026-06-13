import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/contactMessageActions'

export default createCRUDReducer('contactMessage', actions, {
  writeFlag: 'saving',
  beginDelete: true,
}).reducer
