import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/cashflow/transactionActions'

export default createCRUDReducer('transaction', actions, {
  writeFlag: 'saving',
  prependOnCreate: true,
  beginUpdate: true,
  initialState: { importing: false, importProgress: 0 },
  extraCases: (builder) => {
    builder
      .addCase(actions.importRequest, (s) => {
        s.importing = true
        s.importProgress = 0
      })
      .addCase(actions.importProgressUpdate, (s, { payload }) => {
        s.importProgress = payload
      })
      .addCase(actions.importComplete, (s, { payload }) => {
        s.importing = false
        s.importProgress = 100
        s.data = payload
      })
      .addCase(actions.importError, (s, { payload }) => {
        s.importing = false
        s.error = payload
        s.isError = true
      })
  },
}).reducer
