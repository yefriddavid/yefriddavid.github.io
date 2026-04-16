import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/cashflow/accountsMasterActions'

export default createCRUDReducer('accountsMaster', actions, {
  writeFlag: 'saving',
  beginUpdate: true,
  initialState: { seeding: false, seedProgress: 0, patching: false, patchProgress: 0 },
  extraCases: (builder) => {
    builder
      .addCase(actions.seedRequest, (s) => {
        s.seeding = true
        s.seedProgress = 0
      })
      .addCase(actions.seedProgressUpdate, (s, { payload }) => {
        s.seedProgress = payload
      })
      .addCase(actions.seedComplete, (s) => {
        s.seeding = false
        s.seedProgress = 100
      })
      .addCase(actions.seedError, (s, { payload }) => {
        s.seeding = false
        s.error = payload
        s.isError = true
      })
      .addCase(actions.patchManyRequest, (s) => {
        s.patching = true
        s.patchProgress = 0
      })
      .addCase(actions.patchManyProgress, (s, { payload }) => {
        s.patchProgress = payload
      })
      .addCase(actions.patchManyComplete, (s) => {
        s.patching = false
        s.patchProgress = 100
      })
      .addCase(actions.patchManyError, (s, { payload }) => {
        s.patching = false
        s.error = payload
        s.isError = true
      })
  },
}).reducer
