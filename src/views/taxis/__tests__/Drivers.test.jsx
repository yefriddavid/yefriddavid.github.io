// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import Conductores from '../Drivers'
import { makeDriver, makeVehicle } from 'src/__tests__/factories'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('@coreui/icons-react', () => ({ default: () => <span data-testid="icon" /> }))
vi.mock('@coreui/icons', () => ({ cilPlus: 'plus', cilX: 'x', cilTrash: 'trash' }))
vi.mock('src/views/taxis/masters.scss', () => ({}))

vi.mock('@coreui/react', () => ({
  CCard: ({ children, className, style }) => <div className={className} style={style}>{children}</div>,
  CCardBody: ({ children, className, style }) => <div className={className} style={style}>{children}</div>,
  CCardHeader: ({ children, className }) => <div className={className}>{children}</div>,
  CSpinner: () => <span className="spinner-border" />,
  CBadge: ({ children }) => <span>{children}</span>,
  CAlert: ({ children }) => <div>{children}</div>,
  CButton: ({ children, onClick, disabled }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  CCollapse: ({ visible, children }) => visible ? <div data-testid="collapse">{children}</div> : null,
  CRow: ({ children }) => <div>{children}</div>,
  CCol: ({ children }) => <div>{children}</div>,
  CFormSelect: ({ children, onChange, value, className }) => <select onChange={onChange} value={value} className={className}>{children}</select>,
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

vi.mock('src/components/shared/StandardForm', () => ({
  __esModule: true,
  default: ({ title, subtitle, onCancel, onSave, saving, children }) => (
    <div data-testid="standard-form">
      <span data-testid="form-title">{title}</span>
      {subtitle && <span data-testid="form-subtitle">{subtitle}</span>}
      {children}
      {onCancel && <button onClick={onCancel}>cancel</button>}
      <button onClick={onSave} disabled={saving}>
        save
      </button>
    </div>
  ),
  StandardField: ({ label, children }) => (
    <div>
      <label>{label}</label>
      {children}
    </div>
  ),
  SF: { input: '', select: '', textarea: '' },
}))

vi.mock('src/components/shared/DetailPanel', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="detail-panel">{children}</div>,
  DetailSection: ({ title, children }) => (
    <div>
      <strong>{title}</strong>
      {children}
    </div>
  ),
  DetailRow: ({ label, value }) => (
    <div>
      <span>{label}</span>
      <span>{value ?? ''}</span>
    </div>
  ),
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
      expect(document.querySelector('.spinner-border')).toBeTruthy()
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

  describe('create form', () => {
    it('opens create form when "Nuevo conductor" is clicked', () => {
      renderWithRedux(driverState())
      fireEvent.click(screen.getByText('Nuevo conductor'))
      expect(screen.getByTestId('standard-form')).toBeTruthy()
      expect(screen.getByTestId('form-title').textContent).toBe('Nuevo conductor')
    })

    it('closes create form when cancel is clicked', () => {
      renderWithRedux(driverState())
      fireEvent.click(screen.getByText('Nuevo conductor'))
      fireEvent.click(screen.getByText('cancel'))
      expect(screen.queryByTestId('standard-form')).toBeNull()
    })

    it('form closes after saving with valid name and idNumber (createRequest dispatched)', () => {
      // fetchRequest on mount sets fetching=true; dispatch success to re-enable the save button
      const { store } = renderWithRedux(driverState())
      act(() => { store.dispatch(taxiDriverActions.successRequestFetch([])) })

      fireEvent.click(screen.getByText('Nuevo conductor'))
      fireEvent.change(screen.getByPlaceholderText('Nombre completo'), {
        target: { value: 'Nuevo Conductor' },
      })
      fireEvent.change(screen.getByPlaceholderText('123456789'), {
        target: { value: '999888777' },
      })
      fireEvent.click(screen.getByText('save'))

      // handleCreate() is called after dispatch → CCollapse closes (showCreate=false)
      expect(screen.queryByTestId('collapse')).toBeNull()
    })

    it('does not dispatch when name is missing', () => {
      const store = configureStore({ reducer: combinedReducers, preloadedState: driverState() })
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      render(
        <Provider store={store}>
          <Conductores />
        </Provider>,
      )
      const mountCalls = dispatchSpy.mock.calls.length
      fireEvent.click(screen.getByText('Nuevo conductor'))
      // leave name empty, fill idNumber
      fireEvent.change(screen.getByPlaceholderText('123456789'), {
        target: { value: '12345' },
      })
      fireEvent.click(screen.getByText('save'))
      expect(dispatchSpy.mock.calls.length).toBe(mountCalls)
    })
  })
})

// ── DriverForm subcomponent ────────────────────────────────────────────────────

describe('DriverForm', () => {
  const DriverForm = () => {
    // Re-import the internal component by rendering and checking its form behavior
    // We test it indirectly via the create panel shown in Conductores
  }

  it('shows active/inactive toggle button reflecting current active state', () => {
    renderWithRedux(driverState())
    fireEvent.click(screen.getByText('Nuevo conductor'))
    // Default EMPTY has active: true
    expect(screen.getByText('✓ Activo')).toBeTruthy()
  })

  it('toggles active state when the active button is clicked', () => {
    renderWithRedux(driverState())
    fireEvent.click(screen.getByText('Nuevo conductor'))
    fireEvent.click(screen.getByText('✓ Activo'))
    expect(screen.getByText('✗ Inactivo')).toBeTruthy()
  })

  it('lists vehicles in default vehicle select', () => {
    const vehicles = [makeVehicle({ id: 'v1', plate: 'XYZ999', brand: 'Chevrolet' })]
    renderWithRedux({
      ...driverState(),
      taxiVehicle: { data: vehicles, fetching: false },
    })
    fireEvent.click(screen.getByText('Nuevo conductor'))
    expect(screen.getByText('XYZ999 · Chevrolet')).toBeTruthy()
  })
})
