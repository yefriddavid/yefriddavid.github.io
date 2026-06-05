import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/errorLogActions'

export default createCRUDReducer('errorLog', actions, {
  extraCases: (builder) => {
    builder
      .addCase(actions.clearAllRequest, (s) => { s.fetching = true })
      .addCase(actions.successRequestClearAll, (s) => { s.data = []; s.fetching = false })
      .addCase(actions.errorRequestClearAll, (s, { payload }) => { s.error = payload; s.fetching = false })
  },
}).reducer
