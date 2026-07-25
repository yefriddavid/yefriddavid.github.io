const BASE = 'https://open.er-api.com/v6/latest/USD'

export const fetchUsdToCopRate = async () => {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error(`Exchange rate error: ${res.status}`)
  const data = await res.json()
  return data.rates.COP
}

// Official Colombian TRM (Tasa Representativa del Mercado) history —
// Superintendencia Financiera / Banco de la República open dataset. Ordering
// by vigenciadesde desc and taking the first row <= date carries the last
// published value forward across weekends/holidays automatically.
const TRM_HISTORICO_BASE = 'https://www.datos.gov.co/resource/32sa-8pi3.json'

export const fetchHistoricalUsdToCopRate = async (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Fecha inválida')
  const where = encodeURIComponent(`vigenciadesde<='${date}T00:00:00.000'`)
  const res = await fetch(
    `${TRM_HISTORICO_BASE}?$where=${where}&$order=vigenciadesde DESC&$limit=1`,
  )
  if (!res.ok) throw new Error(`TRM histórica error: ${res.status}`)
  const [row] = await res.json()
  return row ? Number(row.valor) : null
}
