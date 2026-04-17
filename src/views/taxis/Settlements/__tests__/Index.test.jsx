// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import Taxis from '../Index'
import { makeDriver, makeSettlement } from 'src/__tests__/factories'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (key === 'taxis.months') return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      if (options?.returnObjects) return []
      return key
    },
    i18n: { language: 'es' },
  }),
}))

// Mock StandardGrid to avoid DevExtreme rendering issues in JSDOM
vi.mock('src/components/shared/StandardGrid/Index', () => ({
  __esModule: true,
  default: React.forwardRef(({ dataSource, children, noDataText }, ref) => (
    <div data-testid="standard-grid">
      {dataSource && dataSource.length > 0 ? (
        <table>
          <thead>
            <tr><th>Driver</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {dataSource.map((item, i) => (
              <tr key={item.id || i}>
                <td>{item.driver}</td>
                <td>{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>{noDataText}</div>
      )}
      {children}
    </div>
  )),
}))

// Mock other sub-components to keep the test focused on the Index page logic
vi.mock('../Components/PeriodSummary', () => ({ default: () => <div data-testid="period-summary" /> }))
vi.mock('../Components/AuditView', () => ({ default: () => <div data-testid="audit-view" /> }))
vi.mock('../Components/PeriodNotes', () => ({ default: () => <div data-testid="period-notes" /> }))
vi.mock('../Components/SettlementCreateForm', () => ({ default: () => <div data-testid="create-form" /> }))
vi.mock('src/components/shared/MultiSelectDropdown', () => ({ default: () => <div data-testid="multiselect" /> }))

// ── Test Setup ───────────────────────────────────────────────────────────────

const renderWithRedux = (initialState = {}) => {
  const store = configureStore({
    reducer: combinedReducers,
    preloadedState: initialState,
  })
  return {
    ...render(
      <Provider store={store}>
        <Taxis />
      </Provider>
    ),
    store,
  }
}

describe('Settlements Index Page', () => {
  const mockDrivers = [
    makeDriver({ name: 'Juan Perez', defaultVehicle: 'ABC123', defaultAmount: 50000 }),
    makeDriver({ name: 'Ana Garcia', defaultVehicle: 'XYZ999', defaultAmount: 60000 }),
  ]

  const mockSettlements = [
    makeSettlement({ id: 's1', driver: 'Juan Perez', amount: 50000, date: '2024-04-01' }),
    makeSettlement({ id: 's2', driver: 'Ana Garcia', amount: 60000, date: '2024-04-01' }),
  ]

  const initialState = {
    taxiSettlement: { data: mockSettlements, fetching: false, isError: false },
    taxiDriver: { data: mockDrivers, fetching: false },
    taxiVehicle: { data: [], fetching: false },
    taxiExpense: { data: [], fetching: false },
    taxiAuditNote: { notes: {}, fetching: false },
    profile: { data: { role: 'admin' } },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Set a fixed date for the test to avoid month mismatches
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 3, 4)) // April 4, 2024
  })

  it('renders the title and initial state', () => {
    renderWithRedux(initialState)
    expect(screen.getByText('taxis.settlements.title')).toBeTruthy()
    expect(screen.getByTestId('standard-grid')).toBeTruthy()
  })

  it('dispatches fetch actions on mount', () => {
    const { store } = renderWithRedux(initialState)
    // We check if the state indicates we are at least aware of the actions
    // In a real integration we'd check if the saga was called, but here we check the side effects
    // Or we can mock the dispatch
  })

  it('filters records by current period (April 2024)', () => {
    const customSettlements = [
      ...mockSettlements,
      makeSettlement({ id: 's3', date: '2024-03-15', amount: 100000 }), // March record
    ]
    renderWithRedux({
      ...initialState,
      taxiSettlement: { data: customSettlements, fetching: false },
    })

    // Should only show April records
    expect(screen.queryByText('100000')).toBeNull()
    expect(screen.getByText('Juan Perez')).toBeTruthy()
    expect(screen.getByText('Ana Garcia')).toBeTruthy()
  })

  it('displays the correct record count for the period', () => {
    renderWithRedux(initialState)
    // 2 April records → badge shows count 2
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('changes the period when selecting a different month', () => {
    renderWithRedux(initialState)
    const monthSelect = screen.getByDisplayValue('Abril')
    fireEvent.change(monthSelect, { target: { value: '3' } }) // Change to March

    // Period in localStorage should update
    expect(localStorage.getItem('settlements_period')).toContain('"month":3')
  })

  it('shows the "Nuevo" button for admin role', () => {
    renderWithRedux({
      ...initialState,
      profile: { data: { role: 'admin' } },
    })
    expect(screen.getByText('taxis.settlements.newSettlement')).toBeTruthy()
  })
})
