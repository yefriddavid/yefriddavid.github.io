// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import Conductores from '../Drivers'
import { makeDriver } from 'src/__tests__/factories'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('@coreui/icons-react', () => ({ default: () => <span data-testid="icon" /> }))
vi.mock('@coreui/icons', () => ({ cilPlus: 'plus', cilTrash: 'trash', cilPencil: 'pencil', cilDescription: 'description' }))
vi.mock('src/views/taxis/masters.scss', () => ({}))

vi.mock('src/hooks/useIsMobile', () => ({ default: vi.fn(() => false) }))

vi.mock('src/components/shared/Spinner', () => ({
  default: () => <span className="spinner-mock" />,
}))

vi.mock('src/components/shared/StatusBadge', () => ({
  default: () => <span data-testid="status-badge" />,
}))

vi.mock('src/components/shared/StandardList/Index', () => ({
  __esModule: true,
  default: ({ data, emptyText }) => (
    <div data-testid="standard-list">
      {data?.length > 0
        ? data.map((d, i) => <div key={d.id ?? i} data-testid="list-row"><span>{d.name}</span></div>)
        : <span>{emptyText}</span>}
    </div>
  ),
  SL: { mono: '', label: '', muted: '' },
}))

vi.mock('@coreui/react', () => ({
  CCard: ({ children, className, style }) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  CCardBody: ({ children, className, style }) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  CCardHeader: ({ children, className }) => <div className={className}>{children}</div>,
  CBadge: ({ children }) => <span>{children}</span>,
  CButton: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('src/components/shared/StandardGrid/Index', () => ({
  __esModule: true,
  default: React.forwardRef(({ dataSource, noDataText, children }, ref) => (
    <div data-testid="standard-grid">
      {dataSource?.length > 0 ? (
        dataSource.map((item, i) => (
          <div key={item.id ?? i} data-testid="grid-row">
            <span>{item.name}</span>
          </div>
        ))
      ) : (
        <span>{noDataText}</span>
      )}
    </div>
  )),
}))

const driverState = (overrides = {}) => ({
  taxiDriver: { data: [], fetching: false, isError: false, error: null, ...overrides },
  taxiVehicle: { data: [], fetching: false },
})

const renderWithRedux = (preloadedState = {}) => {
  const store = configureStore({ reducer: combinedReducers, preloadedState })
  const utils = render(
    <Provider store={store}>
      <Conductores />
    </Provider>,
  )
  return { ...utils, store }
}

describe('Conductores (Drivers)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders "Conductores" title', () => {
      renderWithRedux(driverState())
      expect(screen.getByText('Conductores')).toBeTruthy()
    })

    it('shows driver count badge', () => {
      const drivers = [makeDriver({ id: 'd1' }), makeDriver({ id: 'd2', name: 'Ana' })]
      renderWithRedux(driverState({ data: drivers }))
      expect(screen.getByText('2')).toBeTruthy()
    })

    it('shows "Nuevo conductor" button by default', () => {
      renderWithRedux(driverState())
      expect(screen.getByText('Nuevo conductor')).toBeTruthy()
    })

    it('shows no-data text when list is empty', () => {
      renderWithRedux(driverState({ data: [] }))
      expect(screen.getByText('Sin conductores aún.')).toBeTruthy()
    })

    it('renders driver names in grid', () => {
      const drivers = [makeDriver({ id: 'd1', name: 'Pedro Ramirez' })]
      renderWithRedux(driverState({ data: drivers }))
      expect(screen.getByText('Pedro Ramirez')).toBeTruthy()
    })

    it('shows spinner while loading (fetching=true and data=null)', () => {
      renderWithRedux(driverState({ data: null, fetching: true }))
      expect(document.querySelector('.spinner-mock')).toBeTruthy()
    })
  })

  describe('dispatch on mount', () => {
    it('dispatches fetchRequest for drivers and vehicles on mount', () => {
      const store = configureStore({ reducer: combinedReducers })
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      render(
        <Provider store={store}>
          <Conductores />
        </Provider>,
      )
      expect(dispatchSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('navigation', () => {
    it('navigates to /taxis/drivers/new when "Nuevo conductor" is clicked', () => {
      renderWithRedux(driverState())
      fireEvent.click(screen.getByText('Nuevo conductor'))
      expect(navigateMock).toHaveBeenCalledWith('/taxis/drivers/new')
    })
  })
})
