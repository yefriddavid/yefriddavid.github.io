export const DOMOTICA_DEVICE_TYPES = ['esp8266', 'esp32', 'relay', 'sensor', 'gateway', 'otro']

export const DOMOTICA_DEVICE_STATUS_OPTIONS = ['active', 'inactive', 'error']

export const DOMOTICA_DEVICE_STATUS_COLOR = {
  active: 'success',
  inactive: 'secondary',
  error: 'danger',
}

export const DOMOTICA_DEVICE_STATUS_LABEL = {
  active: 'Activo',
  inactive: 'Inactivo',
  error: 'Error',
}

export const TRANSACTION_TYPE_VOLTAGE = 'voltaje'
export const TRANSACTION_TYPE_CURRENT = 'current'

export const DOMOTICA_CLEANUP_TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: TRANSACTION_TYPE_VOLTAGE, label: 'Voltaje' },
  { value: TRANSACTION_TYPE_CURRENT, label: 'Corriente' },
]

export const DOMOTICA_SERIAL_CATEGORIES = [
  'GPS',
  'Misceláneos',
  'Mensajes',
  'Red',
  'IP Router',
  'Reloj RTC',
  'Audio',
  'GPIO',
  'Macros',
  'Funciones',
  'Buzzer',
  'Movimiento',
  'FOTA',
  'PAD',
  'API TCP',
  'Configuración Celular',
  'Personalizado',
]
