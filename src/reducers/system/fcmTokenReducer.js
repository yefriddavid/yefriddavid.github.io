import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/fcmTokenActions'

export default createCRUDReducer('fcmToken', actions, { beginDelete: true }).reducer
