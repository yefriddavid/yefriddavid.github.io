import * as fb from '../../firebase/taxi/taxiVehicles'
import { saveVehicles } from '../../idb/cashflow/taxiVehicles'

export const getVehicles = async () => {
  const data = await fb.getVehicles()
  try {
    await saveVehicles(data)
  } catch (_) {
    // IDB sync failure is non-critical
  }
  return data
}

export const { addVehicle, updateVehicle, deleteVehicle, updateRestrictions } = fb
