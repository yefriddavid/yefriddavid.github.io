import { put, call, all, takeLatest } from 'redux-saga/effects'

import cloneDeep from 'lodash/cloneDeep'

import * as paymentActions from '../../actions/cashflow/paymentActions'
import * as accountActions from '../../actions/cashflow/accountActions'
import * as paymentVaucherActions from '../../actions/cashflow/paymentVaucherActions'
import { push } from '../../reducers/notificationsSlice'

import * as apiPaymentVaucherServices from '../../services/facade/cashflow/paymentVaucherFacade'
import { getCache, setCache } from '../../services/voucherCache'

export function* addVauchersToAccountPayments({ payload }) {
  try {
    const account = cloneDeep(payload)
    const { payments } = account
    const { items: paymentItems } = payments

    if (paymentItems.filter((e) => e.vaucher === false).length <= 0) return

    // Paso 1: mostrar datos cacheados inmediatamente
    let hasCached = false
    paymentItems.forEach((v) => {
      const cached = getCache(v.paymentId)
      if (cached !== null) {
        v.vaucher = cached
        hasCached = true
      }
    })

    if (hasCached) {
      yield put(accountActions.appendVauchersToAccount(cloneDeep(account)))
    }

    // Paso 2: buscar solo los no cacheados en Firestore (en background)
    const uncached = paymentItems.filter((v) => v.vaucher === false)
    if (uncached.length > 0) {
      const vauchers = yield call(apiPaymentVaucherServices.fetchVaucherPaymentMultiple, uncached)
      uncached.forEach((v) => {
        const found = vauchers.find((i) => i.paymentId === v.paymentId)
        v.vaucher = found ? found.vaucher : ''
        setCache(v.paymentId, v.vaucher)
      })
      yield put(accountActions.appendVauchersToAccount(account))
    }
  } catch (e) {
    // silent — UI shows cached/partial data
  }
}

export function* createPaymentVaucher({ payload }) {
  try {
    yield put(paymentVaucherActions.beginRequestCreate())
    const response = yield call(apiPaymentVaucherServices.CreatePaymentVaucher, payload)
    yield put(paymentVaucherActions.successRequestCreate(response.data))
  } catch (e) {
    yield put(paymentVaucherActions.errorRequestCreate(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest([accountActions.loadVauchersToAccountPayment], addVauchersToAccountPayments),
    takeLatest([paymentActions.successRequestCreate], createPaymentVaucher),
  ])
}
