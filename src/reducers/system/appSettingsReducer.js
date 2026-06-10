import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/system/appSettingsActions'

// Update flow is custom (settings keyed by `key`, tracked via saveSeq/lastSavedKey),
// so only the fetch actions go through the factory cases.
const fetchActions = {
  fetchRequest: actions.fetchRequest,
  beginRequestFetch: actions.beginRequestFetch,
  successRequestFetch: actions.successRequestFetch,
  errorRequestFetch: actions.errorRequestFetch,
}

export default createCRUDReducer('appSettings', fetchActions, {
  initialState: { saveSeq: 0, lastSavedKey: null, saveError: null },
  extraCases: (builder) =>
    builder
      .addCase(actions.updateRequest, (s) => {
        s.saveError = null
      })
      .addCase(actions.successRequestUpdate, (s, { payload: { key, value } }) => {
        if (s.data) s.data = s.data.map((item) => (item.key === key ? { ...item, value } : item))
        s.saveSeq += 1
        s.lastSavedKey = key
      })
      .addCase(actions.errorRequestUpdate, (s, { payload }) => {
        s.saveError = payload
      }),
}).reducer
