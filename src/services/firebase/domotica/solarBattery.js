const BASE_URL = 'https://3.92.69.78:1979'
const BATTERY_API_URL = `${BASE_URL}/api/battery`
const BATTERY_READ_URL = `${BASE_URL}/api/battery/read`
const POLL_INTERVAL_MS = 30_000

const normalise = (data) => ({ ...data, soc: data.percent })

export const subscribeBatteryStatus = (callback) => {
  let cancelled = false

  const fetchBattery = async () => {
    try {
      const res = await fetch(BATTERY_API_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!cancelled) callback(normalise(data))
    } catch {
      // keep last known state on network/parse error
    }
  }

  fetchBattery()
  const id = setInterval(fetchBattery, POLL_INTERVAL_MS)

  return () => {
    cancelled = true
    clearInterval(id)
  }
}

// Triggers an immediate ADC read on the ESP8266 via Node-RED → MQTT,
// then waits for the ESP to respond and returns the fresh reading.
export const triggerRead = async () => {
  await fetch(BATTERY_READ_URL, { method: 'POST' })
  await new Promise((r) => setTimeout(r, 2500))
  const res = await fetch(BATTERY_API_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return normalise(await res.json())
}
