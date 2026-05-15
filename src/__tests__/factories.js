/**
 * Test data factories for the taxis module.
 * Each factory returns a valid entity with sensible defaults.
 * Pass overrides to customize specific fields.
 */

export const makeDriver = (overrides = {}) => ({
  id: 'driver-1',
  name: 'Juan Perez',
  idNumber: '12345678',
  phone: '3001234567',
  defaultAmount: 50000,
  defaultAmountSunday: 30000,
  defaultVehicle: 'ABC123',
  active: true,
  startDate: null,
  endDate: null,
  ...overrides,
})

export const makeVehicle = (overrides = {}) => ({
  id: 'vehicle-1',
  plate: 'ABC123',
  brand: 'Renault',
  model: 'Logan',
  year: 2020,
  active: true,
  restrictions: {},
  ...overrides,
})

export const makeSettlement = (overrides = {}) => ({
  id: 'settlement-1',
  driver: 'Juan Perez',
  plate: 'ABC123',
  amount: 50000,
  date: '2024-03-10',
  comment: null,
  ...overrides,
})

export const makePartner = (overrides = {}) => ({
  id: 'partner-1',
  name: 'Socio A',
  percentage: 40,
  ...overrides,
})

export const makeDistribution = (overrides = {}) => ({
  id: 'dist-1',
  period: '2024-03',
  date: '2024-03-31',
  totalIncome: 1500000,
  totalExpenses: 200000,
  net: 1300000,
  payments: {
    'partner-1': {
      partnerName: 'Socio A',
      percentage: 40,
      calculatedAmount: 520000,
      paidAmount: null,
      paidDate: null,
      paid: false,
    },
    'partner-2': {
      partnerName: 'Socio B',
      percentage: 60,
      calculatedAmount: 780000,
      paidAmount: null,
      paidDate: null,
      paid: false,
    },
  },
  ...overrides,
})

export const makeExpense = (overrides = {}) => ({
  id: 'expense-1',
  description: 'Cambio de aceite',
  category: 'Mantenimiento',
  amount: 80000,
  date: '2024-03-05',
  plate: 'ABC123',
  comment: null,
  paid: false,
  payedAt: null,
  receipt: null,
  receiptName: null,
  ...overrides,
})

export const makeAuditNote = (overrides = {}) => ({
  id: '2024-03-10__Juan_Perez',
  date: '2024-03-10',
  driver: 'Juan Perez',
  note: 'Pagó con retraso',
  ...overrides,
})

export const makePayment = (overrides = {}) => ({
  paymentId: 'pay-1',
  value: 50000,
  date: '2024-03-10',
  vaucher: false,
  ...overrides,
})

export const makeAccount = (overrides = {}) => ({
  accountId: 'acc-1',
  name: 'Account Test',
  payments: {
    items: [makePayment()],
    total: 50000,
  },
  ...overrides,
})

export const makeAccountState = (overrides = {}) => ({
  data: { data: { items: [makeAccount()] } },
  error: null,
  fetching: false,
  isError: false,
  selectedAccount: null,
  selectedVaucher: null,
  ...overrides,
})

export const makeUser = (overrides = {}) => ({
  username: 'jperez',
  name: 'Juan Perez',
  email: 'juan@example.com',
  role: 'manager',
  active: true,
  avatar: null,
  ...overrides,
})

export const makePeriodAttachment = (overrides = {}) => ({
  id: 'att-1',
  periodId: 'period-2024-03',
  name: 'recibo.jpg',
  url: null,
  file: 'base64string',
  createdAt: '2024-03-10T10:00:00Z',
  ...overrides,
})

export const makePeriodNote = (overrides = {}) => ({
  id: 'note-1',
  periodId: 'period-2024-03',
  text: 'Nota de ejemplo',
  createdAt: '2024-03-10T10:00:00Z',
  author: 'jperez',
  ...overrides,
})

export const makeStatusNote = (overrides = {}) => ({
  id: 'snote-1',
  accountId: 'acc-1',
  text: 'Estado revisado',
  createdAt: '2024-03-10T10:00:00Z',
  author: 'jperez',
  ...overrides,
})

export const makeAccountMaster = (overrides = {}) => ({
  id: 'am-1',
  name: 'Cuenta Bancaria',
  type: 'bank',
  active: true,
  balance: 1000000,
  ...overrides,
})

export const makeAsset = (overrides = {}) => ({
  id: 'asset-1',
  name: 'Laptop',
  value: 3000000,
  category: 'tech',
  syncedAt: null,
  ...overrides,
})

export const makeEgg = (overrides = {}) => ({
  id: 'egg-1',
  amount: 500000,
  description: 'Ahorro mensual',
  date: '2024-03-01',
  ...overrides,
})

export const makeGridTrade = (overrides = {}) => ({
  id: 'gt-1',
  symbol: 'BTCUSDT',
  lowerPrice: 20000,
  upperPrice: 30000,
  grids: 10,
  investment: 1000,
  ...overrides,
})

export const makeProject = (overrides = {}) => ({
  id: 'proj-1',
  name: 'Proyecto Alpha',
  description: 'Descripción del proyecto',
  active: true,
  syncedAt: null,
  ...overrides,
})

export const makeCustomGridTrade = (overrides = {}) => ({
  id: 'cgt-1',
  symbol: 'ETHUSDT',
  lowerPrice: 1500,
  upperPrice: 2500,
  grids: 5,
  investment: 500,
  ...overrides,
})

export const makeTenant = (overrides = {}) => ({
  id: 'tenant-1',
  name: 'Arrendatario A',
  email: 'arrendatario@example.com',
  phone: '3101234567',
  active: true,
  ...overrides,
})

export const makeDomoticaDevice = (overrides = {}) => ({
  id: 'dev-1',
  name: 'Sensor Temperatura',
  type: 'sensor',
  active: true,
  topic: 'home/sensor/temp',
  ...overrides,
})

export const makeDomoticaCommand = (overrides = {}) => ({
  id: 'cmd-1',
  name: 'Encender luz',
  topic: 'home/light/on',
  payload: '1',
  active: true,
  ...overrides,
})

export const makeDomoticaProfile = (overrides = {}) => ({
  id: 'profile-1',
  name: 'Perfil Casa',
  description: 'Perfil para control de casa',
  ...overrides,
})

export const makeDomoticaProfileItem = (overrides = {}) => ({
  id: 'item-1',
  profileId: 'profile-1',
  commandId: 'cmd-1',
  order: 0,
  ...overrides,
})
