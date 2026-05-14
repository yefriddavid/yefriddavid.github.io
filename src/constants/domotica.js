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

export const DOMOTICA_CLEANUP_TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'voltaje', label: 'Voltaje' },
  { value: 'corriente', label: 'Corriente' },
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
  'Personalizado',
]
