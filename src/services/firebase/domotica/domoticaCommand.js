import { ref, get, update } from 'firebase/database'
import { rtdb } from '../settings'

const PATH = 'solar/commands'

// UI key → RTDB node name
const UI_TO_RTDB = {
  voltage_read: 'read_voltage',
  current_read: 'read_current',
}

const RTDB_TO_UI = Object.fromEntries(Object.entries(UI_TO_RTDB).map(([k, v]) => [v, k]))

export const fetchCommands = async () => {
  const snap = await get(ref(rtdb, PATH))
  const data = snap.val() ?? {}
  const result = {}
  for (const [rtdbKey, uiKey] of Object.entries(RTDB_TO_UI)) {
    if (data[rtdbKey] != null) {
      result[uiKey] = { id: uiKey, ...data[rtdbKey] }
    }
  }
  return result
}

export const updateCommand = async (id, fields) => {
  const rtdbKey = UI_TO_RTDB[id]
  if (!rtdbKey) throw new Error(`Unknown command id: ${id}`)
  await update(ref(rtdb, `${PATH}/${rtdbKey}`), fields)
}
