import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../actions/usersActions'

export default createCRUDReducer('users', actions, {
  sortKey: 'name',
  idKey: 'username',
  beginUpdate: true,
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
          s.sessions[username].data = s.sessions[username].data.filter(
            (sess) => sess.sessionId !== sessionId,
          )
        }
      })
      .addCase(actions.deleteAllSessionsSuccess, (s, { payload: { username } }) => {
        if (s.sessions[username]) {
          s.sessions[username].data = []
        }
      })
      .addCase(actions.adminResetPasswordRequest, (s) => {
        s.resetLoading = true
        s.resetError = null
        s.resetSuccess = null
      })
      .addCase(actions.adminResetPasswordSuccess, (s, { payload: { username } }) => {
        s.resetLoading = false
        s.resetError = null
        s.resetSuccess = username
      })
      .addCase(actions.adminResetPasswordError, (s, { payload: { error } }) => {
        s.resetLoading = false
        s.resetError = error
        s.resetSuccess = null
      })
  },
}).reducer
