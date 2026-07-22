import { fmtNum } from 'src/utils/formatters'
import {
  CRYPTO_WITHDRAWAL_STATUS_LABELS,
  CRYPTO_WITHDRAWAL_STATUS_VARIANTS,
} from 'src/constants/finance'

export const fmtAmount = (amount, coin) => `${fmtNum(amount, 8)} ${coin}`

export const statusLabel = (status) => CRYPTO_WITHDRAWAL_STATUS_LABELS[status] ?? 'Desconocido'

export const statusVariant = (status) => CRYPTO_WITHDRAWAL_STATUS_VARIANTS[status] ?? 'default'

// applyTime comes from Binance as "YYYY-MM-DD HH:mm:ss" — split without parsing.
export const splitApplyTime = (applyTime) => {
  const [date, time] = (applyTime ?? '').split(' ')
  return { date: date ?? '', time: time ?? '' }
}
