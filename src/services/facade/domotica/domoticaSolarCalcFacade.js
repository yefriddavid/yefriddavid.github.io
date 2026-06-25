import * as remote from '../../firebase/domotica/solarCalc'
import * as local from '../../idb/solarCalcLocal'

let _impl = remote

export const configure = (storage) => {
  _impl = storage === 'local' ? local : remote
}

export const fetchSolarCalcConfigs = () => _impl.fetchSolarCalcConfigs()
export const createSolarCalcConfig = (data) => _impl.createSolarCalcConfig(data)
export const updateSolarCalcConfig = (id, data) => _impl.updateSolarCalcConfig(id, data)
export const deleteSolarCalcConfig = (id) => _impl.deleteSolarCalcConfig(id)
