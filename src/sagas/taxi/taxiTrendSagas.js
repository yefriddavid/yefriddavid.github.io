import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiTrendActions'
import * as settlementService from '../../services/facade/taxi/taxiSettlementFacade'
import * as expenseService from '../../services/facade/taxi/taxiExpenseFacade'

function* fetchTrend({ payload: { from, to, periodKey } }) {
  try {
    yield put(actions.beginRequestFetch())
    const [settlements, expenses] = yield all([
      call(settlementService.getSettlements, { from, to }),
      call(expenseService.fetchExpenses, { from, to }),
    ])
    yield put(actions.successRequestFetch({ settlements, expenses, periodKey }))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export default function* rootSagas() {
  yield all([takeLatest(actions.fetchRequest, fetchTrend)])
}
