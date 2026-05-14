import { fmt, fmtNum as baseFmtNum } from 'src/utils/formatters'

export { fmt }

export const uid = () => crypto.randomUUID()
export const now = () => new Date().toISOString()

export const fmtNum = (n, decimals = 6) => (n != null && n !== '' ? baseFmtNum(n, decimals) : '—')
