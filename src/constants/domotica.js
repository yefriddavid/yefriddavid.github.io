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

export const SOLAR_APPLIANCE_PRESETS = [
  { name: 'Bombillo LED',          watts: 9,    hours: 6  },
  { name: 'Bombillo LED (x4)',     watts: 36,   hours: 6  },
  { name: 'Televisor',             watts: 100,  hours: 4  },
  { name: 'Ventilador',            watts: 60,   hours: 8  },
  { name: 'Aire acondicionado',    watts: 1200, hours: 4  },
  { name: 'Nevera',                watts: 150,  hours: 8  },
  { name: 'Computador portátil',   watts: 65,   hours: 6  },
  { name: 'Cargador celular',      watts: 10,   hours: 3  },
  { name: 'Router WiFi',           watts: 12,   hours: 24 },
  { name: 'Bomba de agua',         watts: 750,  hours: 1  },
  { name: 'Lavadora',              watts: 500,  hours: 1  },
  { name: 'Microondas',            watts: 1000, hours: 0.5},
  { name: 'Plancha de ropa',       watts: 1000, hours: 0.5},
  { name: 'Licuadora',             watts: 300,  hours: 0.3},
  { name: 'Equipo de sonido',      watts: 50,   hours: 3  },
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
