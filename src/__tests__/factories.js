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
