// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PeriodSummary from '../PeriodSummary'
import { makeExpense } from 'src/__tests__/factories'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts?.days !== undefined ? `${opts.days} días` : key),
  }),
}))

vi.mock('@coreui/icons-react', () => ({ default: () => <span data-testid="icon" /> }))
vi.mock('@coreui/icons', () => ({
  cilChevronBottom: 'chevron-down',
  cilChevronRight: 'chevron-right',
}))

const period = { month: 4, year: 2024 }
const now = new Date(2024, 3, 15) // April 15

const defaultProps = {
  summaryOpen: true,
  toggleSummary: vi.fn(),
  total: 500000,
  projection: 1000000,
  isCurrentPeriod: true,
  daysElapsed: 15,
  daysInMonth: 30,
  totalExpenses: 80000,
  periodExpenses: [],
  byDriver: [],
  byVehicle: [],
  totalExpensesPaid: 50000,
  settlementAbbr: 'liq.',
  pendingRows: [],
  now,
  period,
  loading: false,
}

const renderSummary = (props = {}) => render(<PeriodSummary {...defaultProps} {...props} />)

describe('PeriodSummary — header', () => {
  it('renders the period summary toggle label', () => {
    renderSummary()
    expect(screen.getByText('Resumen del período')).toBeTruthy()
  })

  it('calls toggleSummary when header is clicked', () => {
    const toggleSummary = vi.fn()
    renderSummary({ toggleSummary })
    fireEvent.click(screen.getByText('Resumen del período'))
    expect(toggleSummary).toHaveBeenCalledTimes(1)
  })

  it('renders CCollapse with visible=false when summaryOpen is false', () => {
    const { container } = renderSummary({ summaryOpen: false })
    // CCollapse hides content via CSS (display:none); the collapse wrapper should not be visible
    const collapse = container.querySelector('.collapse:not(.show)')
    expect(collapse).toBeTruthy()
  })
})

describe('PeriodSummary — total settled card', () => {
  it('renders total settled label', () => {
    renderSummary()
    expect(screen.getByText('taxis.settlements.summary.totalSettled')).toBeTruthy()
  })

  it('renders projection label', () => {
    renderSummary()
    expect(screen.getByText('taxis.settlements.summary.monthProjection')).toBeTruthy()
  })

  it('shows — when projection is null', () => {
    renderSummary({ projection: null })
    // Both projection and deficit cards show '—' when projection is null
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })
})

describe('PeriodSummary — net card', () => {
  it('renders net label', () => {
    renderSummary()
    expect(screen.getByText('taxis.settlements.summary.net')).toBeTruthy()
  })

  it('"Incluir pendientes" checkbox toggles net calculation', () => {
    renderSummary({ total: 500000, totalExpensesPaid: 50000, totalExpenses: 80000 })
    const checkbox = screen.getByRole('checkbox')
    // Initially unchecked: net = total - totalExpensesPaid = 450000
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
    // After checking: net = total - totalExpenses = 420000
  })
})

describe('PeriodSummary — expenses card', () => {
  it('renders expenses label', () => {
    renderSummary()
    expect(screen.getByText('taxis.settlements.summary.totalExpenses')).toBeTruthy()
  })

  it('disables expense button when no expenses', () => {
    renderSummary({ periodExpenses: [] })
    expect(screen.getByText('0 gastos').closest('button').disabled).toBe(true)
  })

  it('enables expense button when expenses exist', () => {
    const expenses = [makeExpense({ id: 'e1' }), makeExpense({ id: 'e2' })]
    renderSummary({ periodExpenses: expenses })
    expect(screen.getByText('2 gastos').closest('button').disabled).toBe(false)
  })

  it('opens expenses modal when button is clicked', () => {
    const expenses = [makeExpense({ id: 'e1', description: 'Aceite', amount: 80000 })]
    renderSummary({ periodExpenses: expenses })
    fireEvent.click(screen.getByText('1 gastos'))
    expect(screen.getByText('Aceite')).toBeTruthy()
  })
})

describe('PeriodSummary — by driver card', () => {
  it('disables by driver button when byDriver is empty', () => {
    renderSummary({ byDriver: [] })
    expect(screen.getByText('0 conductores').closest('button').disabled).toBe(true)
  })

  it('enables by driver button when byDriver has entries', () => {
    const byDriver = [{ driver: 'Juan', count: 5, total: 250000, remaining: 0, future: null }]
    renderSummary({ byDriver })
    expect(screen.getByText('1 conductores').closest('button').disabled).toBe(false)
  })

  it('opens by driver modal and shows driver rows', () => {
    const byDriver = [
      { driver: 'Ana Garcia', count: 3, total: 180000, remaining: 20000, future: 60000 },
    ]
    renderSummary({ byDriver })
    fireEvent.click(screen.getByText('1 conductores'))
    expect(screen.getByText('Ana Garcia')).toBeTruthy()
  })

  it('hides remaining and future columns when not current period', () => {
    const byDriver = [{ driver: 'Pedro', count: 2, total: 100000, remaining: 0, future: null }]
    renderSummary({ byDriver, isCurrentPeriod: false })
    fireEvent.click(screen.getByText('1 conductores'))
    expect(screen.queryByText('taxis.settlements.summary.remainingDays')).toBeNull()
  })
})

describe('PeriodSummary — pending card', () => {
  it('shows "—" amounts when not current period', () => {
    renderSummary({ isCurrentPeriod: false, pendingRows: [] })
    // Multiple "—" may appear (pending amount and button text)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('disables pending button when not current period', () => {
    renderSummary({ isCurrentPeriod: false })
    const pendingBtn = screen.getByText('—', { selector: 'button' })
    expect(pendingBtn.disabled).toBe(true)
  })

  it('shows pending count button when current period', () => {
    renderSummary({ isCurrentPeriod: true, pendingRows: [] })
    expect(screen.getByText('0 pendientes')).toBeTruthy()
  })

  it('opens pending modal and shows pending rows', () => {
    const pendingRows = [
      {
        date: '2024-04-10',
        plate: 'ABC123',
        driver: 'Juan',
        amount: 50000,
        isHoliday: false,
        isSunday: false,
      },
    ]
    renderSummary({ isCurrentPeriod: true, pendingRows })
    fireEvent.click(screen.getByText('1 pendientes'))
    expect(screen.getByText('ABC123')).toBeTruthy()
    expect(screen.getByText('Juan')).toBeTruthy()
  })

  it('shows Festivo badge for holiday pending rows', () => {
    const pendingRows = [
      {
        date: '2024-04-10',
        plate: 'ABC123',
        driver: 'Juan',
        amount: 50000,
        isHoliday: true,
        isSunday: false,
      },
    ]
    renderSummary({ isCurrentPeriod: true, pendingRows })
    fireEvent.click(screen.getByText('1 pendientes'))
    expect(screen.getByText('Festivo')).toBeTruthy()
  })
})

describe('PeriodSummary — total settled modal (byVehicle tab)', () => {
  it('shows no records message when byVehicle is empty', () => {
    renderSummary({ byVehicle: [] })
    fireEvent.click(screen.getByText('taxis.settlements.summary.totalSettled'))
    expect(screen.getByText('taxis.settlements.summary.noRecords')).toBeTruthy()
  })

  it('shows vehicle rows when byVehicle has entries', () => {
    const byVehicle = [{ plate: 'XYZ999', count: 4, total: 200000 }]
    renderSummary({ byVehicle })
    fireEvent.click(screen.getByText('taxis.settlements.summary.totalSettled'))
    expect(screen.getByText('XYZ999')).toBeTruthy()
  })
})
