import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../actions/usersActions'

export default createCRUDReducer('users', actions, {
  sortKey: 'name',
  idKey: 'username',
  initialState: { sessions: {} },
  extraCases: (builder) => {
    builder
      .addCase(actions.fetchSessionsRequest, (s, { payload: username }) => {
        s.sessions[username] = { data: [], fetching: true, error: null }
      })
      .addCase(actions.fetchSessionsSuccess, (s, { payload: { username, sessions } }) => {
        s.sessions[username] = { data: sessions, fetching: false, error: null }
      })
      .addCase(actions.fetchSessionsError, (s, { payload: { username, error } }) => {
        s.sessions[username] = { data: [], fetching: false, error }
      })
      .addCase(actions.deleteSessionSuccess, (s, { payload: { username, sessionId } }) => {
        if (s.sessions[username]) {
          s.sessions[username].data = s.sessions[username].data.filter((sess) => sess.sessionId !== sessionId)
        }
      })
  },
}).reducer
