import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/usageMetricsActions'

export default createCRUDReducer('usageMetrics', actions).reducer
