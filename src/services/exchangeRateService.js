const BASE = 'https://open.er-api.com/v6/latest/USD'

export const fetchUsdToCopRate = async () => {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error(`Exchange rate error: ${res.status}`)
  const data = await res.json()
  return data.rates.COP
}
