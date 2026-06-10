export const fmtUsd = (n, dec = 2) =>
  n != null && isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : '—'
