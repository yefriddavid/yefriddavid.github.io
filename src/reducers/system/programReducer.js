import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/programActions'

export default createCRUDReducer('program', actions, {
  writeFlag: 'saving',
  beginUpdate: true,
  beginDelete: true,
}).reducer
