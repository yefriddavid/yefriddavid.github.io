export const TYPE_VEHICLE = 'vehicle'
export const TYPE_DRIVER = 'driver'
export const TYPE_SETTLEMENT = 'settlement'
export const TYPE_EXPENSE = 'expense'

export const TYPE_LABELS = {
  [TYPE_VEHICLE]: '🚕 Vehículo',
  [TYPE_DRIVER]: '👤 Conductor',
  [TYPE_SETTLEMENT]: '💵 Liquidación',
  [TYPE_EXPENSE]: '💸 Gasto',
}

export const TYPE_DISPLAY_NAME = {
  [TYPE_VEHICLE]: 'Vehículo',
  [TYPE_DRIVER]: 'Conductor',
  [TYPE_SETTLEMENT]: 'Liquidación',
  [TYPE_EXPENSE]: 'Gasto',
}

export const STEPS = {
  [TYPE_VEHICLE]: [
    {
      id: 'plate',
      question: '¿Cuál es la placa?',
      inputType: 'text',
      placeholder: 'ABC-123',
      required: true,
    },
    {
      id: 'brand',
      question: '¿La marca?',
      inputType: 'text',
      placeholder: 'Renault',
      required: true,
    },
    {
      id: 'model',
      question: '¿El modelo?',
      inputType: 'text',
      placeholder: 'Logan',
      required: false,
    },
    {
      id: 'year',
      question: '¿El año?',
      inputType: 'number',
      placeholder: String(new Date().getFullYear()),
      required: false,
    },
  ],
  [TYPE_DRIVER]: [
    {
      id: 'name',
      question: '¿Nombre completo del conductor?',
      inputType: 'text',
      placeholder: 'Juan Pérez',
      required: true,
    },
    {
      id: 'idNumber',
      question: '¿Número de cédula?',
      inputType: 'text',
      placeholder: '123456789',
      required: true,
    },
    {
      id: 'phone',
      question: '¿Teléfono de contacto?',
      inputType: 'text',
      placeholder: '300 000 0000',
      required: false,
    },
    {
      id: 'defaultAmount',
      question: '¿Valor de liquidación normal?',
      inputType: 'number',
      placeholder: '85000',
      required: false,
    },
    {
      id: 'defaultVehicle',
      question: '¿Taxi asignado por defecto?',
      inputType: 'vehicle-select',
      required: false,
    },
  ],
  [TYPE_SETTLEMENT]: [
    {
      id: 'driver',
      question: '¿Qué conductor vas a liquidar?',
      inputType: 'driver-select',
      required: true,
    },
    { id: 'date', question: '¿La fecha?', inputType: 'date', required: true },
    {
      id: 'amount',
      question: '¿El valor de la liquidación?',
      inputType: 'number',
      placeholder: '85000',
      required: true,
    },
    {
      id: 'comment',
      question: '¿Algún comentario?',
      inputType: 'text',
      placeholder: 'Opcional...',
      required: false,
    },
  ],
  [TYPE_EXPENSE]: [
    {
      id: 'category',
      question: '¿Qué categoría de gasto?',
      inputType: 'category-select',
      required: true,
    },
    {
      id: 'description',
      question: '¿Descripción del gasto?',
      inputType: 'text',
      placeholder: 'Ej: Cambio de llantas',
      required: true,
    },
    {
      id: 'amount',
      question: '¿Cuánto costó?',
      inputType: 'number',
      placeholder: '150000',
      required: true,
    },
    { id: 'date', question: '¿La fecha del gasto?', inputType: 'date', required: true },
    {
      id: 'plate',
      question: '¿A qué taxi corresponde?',
      inputType: 'vehicle-select',
      required: false,
    },
    {
      id: 'comment',
      question: '¿Algún comentario?',
      inputType: 'text',
      placeholder: 'Opcional...',
      required: false,
    },
  ],
}
