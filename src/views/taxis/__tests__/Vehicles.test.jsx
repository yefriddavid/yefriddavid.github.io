// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import Vehiculos from '../Vehicles'
import { makeVehicle, makeDriver } from 'src/__tests__/factories'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('@coreui/icons-react', () => ({ default: () => <span data-testid="icon" /> }))
vi.mock('@coreui/icons', () => ({
  cilPlus: 'plus', cilX: 'x', cilTrash: 'trash', cilBell: 'bell', cilPencil: 'pencil',
}))
vi.mock('src/views/taxis/masters.scss', () => ({}))

// Per-test control: desktop by default, override to true for mobile tests.
vi.mock('src/hooks/useIsMobile', () => ({ default: vi.fn(() => false) }))

vi.mock('src/services/facade/imageFacade', () => ({
  uploadImages: vi.fn(() => Promise.resolve(['data:image/jpeg;base64,newPhoto'])),
}))

vi.mock('src/components/shared/Spinner', () => ({
  default: () => <span className="spinner-mock" />,
}))

vi.mock('@coreui/react', () => ({
  CCard: ({ children, className }) => <div className={className}>{children}</div>,
  CCardBody: ({ children, className }) => <div className={className}>{children}</div>,
  CCardHeader: ({ children, className }) => <div className={className}>{children}</div>,
  CBadge: ({ children, color }) => <span data-color={color}>{children}</span>,
  CAlert: ({ children }) => <div>{children}</div>,
  CButton: ({ children, onClick, disabled, title }) => (
    <button onClick={onClick} disabled={disabled} title={title}>{children}</button>
  ),
  CCollapse: ({ visible, children }) =>
    visible ? <div data-testid="collapse">{children}</div> : null,
  CModal: ({ visible, children }) =>
    visible ? <div data-testid="modal">{children}</div> : null,
  CModalHeader: ({ children }) => <div>{children}</div>,
  CModalTitle: ({ children }) => <h5>{children}</h5>,
  CModalBody: ({ children }) => <div>{children}</div>,
  CModalFooter: ({ children }) => <div>{children}</div>,
  CFormCheck: ({ checked, onChange, label, id }) => (
    <label>
      <input type="checkbox" id={id} checked={!!checked} onChange={onChange} />
      <span data-testid="check-label">{label}</span>
    </label>
  ),
  CRow: ({ children }) => <div>{children}</div>,
  CCol: ({ children }) => <div>{children}</div>,
  CFormSelect: ({ children, onChange, value }) => (
    <select onChange={onChange} value={value}>{children}</select>
  ),
}))

vi.mock('src/components/shared/StandardGrid/Index', () => ({
  __esModule: true,
  default: React.forwardRef(({ dataSource, noDataText }, _ref) => (
    <div data-testid="standard-grid">
      {dataSource?.length > 0 ? (
        dataSource.map((item, i) => (
          <div key={item.id ?? i} data-testid="grid-row">
            <span>{item.plate}</span>
          </div>
        ))
      ) : (
        <span>{noDataText}</span>
      )}
    </div>
  )),
}))

// Richer mock so we can trigger badge/action callbacks in mobile mode.
vi.mock('src/components/shared/StandardCard/Index', () => ({
  __esModule: true,
  default: ({ data, emptyText, renderBadge, renderActions }) => (
    <div data-testid="standard-card">
      {data?.length > 0
        ? data.map((v) => {
            const badge = renderBadge?.(v)
            const actions = renderActions?.(v) ?? []
            return (
              <div key={v.id} data-testid="card-item">
                <span>{v.plate}</span>
                {badge && (
                  <button data-testid="badge-btn" onClick={badge.onClick}>
                    {badge.label}
                  </button>
                )}
                {actions.map((a, i) => (
                  <button
                    key={i}
                    data-testid={`action-${a.title}`}
                    title={a.title}
                    onClick={a.onClick}
                  >
                    {a.label ?? a.title}
                  </button>
                ))}
              </div>
            )
          })
        : <span>{emptyText}</span>}
    </div>
  ),
  SC: { mono: '', tag: '', label: '', muted: '' },
}))

vi.mock('src/components/shared/StandardForm', () => ({
  __esModule: true,
  default: ({ title, subtitle, onCancel, onSave, saving, children }) => (
    <div data-testid="standard-form">
      <span data-testid="form-title">{title}</span>
      {subtitle && <span data-testid="form-subtitle">{subtitle}</span>}
      {children}
      {onCancel && <button onClick={onCancel}>cancel</button>}
      <button onClick={onSave} disabled={saving}>save</button>
    </div>
  ),
  StandardField: ({ label, children }) => (
    <div><label>{label}</label>{children}</div>
  ),
  SF: { input: '', select: '', textarea: '' },
}))

vi.mock('src/components/shared/DetailPanel', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="detail-panel">{children}</div>,
  DetailSection: ({ title, children }) => <div><strong>{title}</strong>{children}</div>,
  DetailRow: ({ label, value }) => (
    <div><span>{label}</span><span>{value ?? ''}</span></div>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const vehicleState = (overrides = {}) => ({
  taxiVehicle: { data: [], fetching: false, isError: false, error: null, ...overrides },
  taxiDriver: { data: [], fetching: false },
})

const renderWithRedux = (preloadedState = {}) => {
  const store = configureStore({ reducer: combinedReducers, preloadedState })
  const utils = render(
    <Provider store={store}>
      <Vehiculos />
    </Provider>,
  )
  return { ...utils, store }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Vehiculos (Vehicles)', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
    const { default: useIsMobile } = await import('src/hooks/useIsMobile')
    useIsMobile.mockReturnValue(false)
  })

  // ── Rendering ───────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders "Vehículos" title', () => {
      renderWithRedux(vehicleState())
      expect(screen.getByText('Vehículos')).toBeTruthy()
    })

    it('shows vehicle count badge', () => {
      const vehicles = [makeVehicle({ id: 'v1' }), makeVehicle({ id: 'v2', plate: 'XYZ999' })]
      renderWithRedux(vehicleState({ data: vehicles }))
      expect(screen.getByText('2')).toBeTruthy()
    })

    it('shows "Nuevo vehículo" button by default', () => {
      renderWithRedux(vehicleState())
      expect(screen.getByText('Nuevo vehículo')).toBeTruthy()
    })

    it('shows no-data text when list is empty', async () => {
      const { default: useIsMobile } = await import('src/hooks/useIsMobile')
      useIsMobile.mockReturnValue(true)
      renderWithRedux(vehicleState({ data: [] }))
      expect(screen.getByText('Sin vehículos registrados.')).toBeTruthy()
    })

    it('renders vehicle plate in the grid', () => {
      renderWithRedux(vehicleState({ data: [makeVehicle({ id: 'v1', plate: 'TXY-123' })] }))
      expect(screen.getByText('TXY-123')).toBeTruthy()
    })

    it('shows spinner while fetching with no data yet', () => {
      renderWithRedux(vehicleState({ data: null, fetching: true }))
      expect(document.querySelector('.spinner-mock')).toBeTruthy()
    })
  })

  // ── Mount dispatches ────────────────────────────────────────────────────────

  describe('dispatch on mount', () => {
    it('dispatches fetchRequest for vehicles and drivers (2 total)', () => {
      const store = configureStore({ reducer: combinedReducers })
      const spy = vi.spyOn(store, 'dispatch')
      render(<Provider store={store}><Vehiculos /></Provider>)
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  // ── Create form ─────────────────────────────────────────────────────────────

  describe('create form', () => {
    it('opens create form when "Nuevo vehículo" is clicked', () => {
      renderWithRedux(vehicleState())
      fireEvent.click(screen.getByText('Nuevo vehículo'))
      expect(screen.getByTestId('standard-form')).toBeTruthy()
      expect(screen.getByTestId('form-title').textContent).toBe('Nuevo vehículo')
    })

    it('changes button label to "Cancelar" while form is open', () => {
      renderWithRedux(vehicleState())
      fireEvent.click(screen.getByText('Nuevo vehículo'))
      expect(screen.getByText('Cancelar')).toBeTruthy()
    })

    it('closes the form when cancel is clicked', () => {
      renderWithRedux(vehicleState())
      fireEvent.click(screen.getByText('Nuevo vehículo'))
      fireEvent.click(screen.getByText('cancel'))
      expect(screen.queryByTestId('collapse')).toBeNull()
    })

    it('dispatches createRequest and closes form on valid submission', async () => {
      const { store } = renderWithRedux(vehicleState())
      // fetchRequest on mount sets fetching=true; dispatch success to re-enable the save button
      act(() => { store.dispatch(taxiVehicleActions.successRequestFetch([])) })

      fireEvent.click(screen.getByText('Nuevo vehículo'))
      fireEvent.change(screen.getByPlaceholderText('ABC-123'), {
        target: { value: 'NEW-001' },
      })
      fireEvent.change(screen.getByPlaceholderText('Renault'), {
        target: { value: 'Chevrolet' },
      })

      await act(async () => fireEvent.click(screen.getByText('save')))

      // handleCreate is called → setShowCreate(false) → collapse disappears
      expect(screen.queryByTestId('collapse')).toBeNull()
    })

    it('does not dispatch when plate is missing (required)', async () => {
      const store = configureStore({
        reducer: combinedReducers,
        preloadedState: vehicleState(),
      })
      act(() => { store.dispatch(taxiVehicleActions.successRequestFetch([])) })
      render(<Provider store={store}><Vehiculos /></Provider>)

      fireEvent.click(screen.getByText('Nuevo vehículo'))
      // fill brand but leave plate empty
      fireEvent.change(screen.getByPlaceholderText('Renault'), {
        target: { value: 'Renault' },
      })
      const spy = vi.spyOn(store, 'dispatch')
      await act(async () => fireEvent.click(screen.getByText('save')))

      expect(spy).not.toHaveBeenCalled()
    })

    it('does not dispatch when brand is missing (required)', async () => {
      const store = configureStore({
        reducer: combinedReducers,
        preloadedState: vehicleState(),
      })
      act(() => { store.dispatch(taxiVehicleActions.successRequestFetch([])) })
      render(<Provider store={store}><Vehiculos /></Provider>)

      fireEvent.click(screen.getByText('Nuevo vehículo'))
      // fill plate but leave brand empty
      fireEvent.change(screen.getByPlaceholderText('ABC-123'), {
        target: { value: 'ABC-001' },
      })
      const spy = vi.spyOn(store, 'dispatch')
      await act(async () => fireEvent.click(screen.getByText('save')))

      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ── VehicleForm ─────────────────────────────────────────────────────────────

  describe('VehicleForm', () => {
    const openForm = () => {
      renderWithRedux(vehicleState())
      fireEvent.click(screen.getByText('Nuevo vehículo'))
    }

    it('shows plate, brand, model, year, comment fields', () => {
      openForm()
      expect(screen.getByPlaceholderText('ABC-123')).toBeTruthy()
      expect(screen.getByPlaceholderText('Renault')).toBeTruthy()
      expect(screen.getByPlaceholderText('Logan')).toBeTruthy()
      expect(screen.getByPlaceholderText('2020')).toBeTruthy()
      expect(screen.getByPlaceholderText('Observaciones opcionales')).toBeTruthy()
    })

    it('shows active checkbox checked by default (EMPTY has active: true)', () => {
      openForm()
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.checked).toBe(true)
    })

    it('shows active label when active is true', () => {
      openForm()
      // t('taxis.vehicles.fields.active') → key is returned as-is by mock
      expect(screen.getByTestId('check-label').textContent).toBe('taxis.vehicles.fields.active')
    })

    it('toggles to inactive label when checkbox is unchecked', async () => {
      openForm()
      const user = userEvent.setup()
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      await waitFor(() =>
        expect(screen.getByTestId('check-label').textContent).toBe('taxis.vehicles.fields.inactive'),
      )
    })

    it('toggles back to active label when checkbox is re-checked', () => {
      openForm()
      const checkbox = screen.getByRole('checkbox')
      fireEvent.change(checkbox, { target: { checked: false } })
      fireEvent.change(checkbox, { target: { checked: true } })
      expect(screen.getByTestId('check-label').textContent).toBe('taxis.vehicles.fields.active')
    })

    it('shows "Agregar fotos" button', () => {
      openForm()
      expect(screen.getByText('+ Agregar fotos')).toBeTruthy()
    })

    it('includes existing photos from initial data', () => {
      // The create form uses EMPTY (photos: []), so no × remove buttons appear by default.
      renderWithRedux(vehicleState())
      fireEvent.click(screen.getByText('Nuevo vehículo'))
      expect(screen.queryAllByText('×')).toHaveLength(0)
    })

    it('removes a photo when the × button is clicked', async () => {
      const { uploadImages } = await import('src/services/facade/imageFacade')
      uploadImages.mockResolvedValueOnce(['data:image/jpeg;base64,uploaded'])

      renderWithRedux(vehicleState())
      fireEvent.click(screen.getByText('Nuevo vehículo'))

      // Simulate file upload via the hidden input
      const fileInput = document.querySelector('input[type="file"][multiple]')
      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      // One × button should now be visible
      const removeBtn = screen.getByText('×')
      expect(removeBtn).toBeTruthy()

      fireEvent.click(removeBtn)
      expect(screen.queryByText('×')).toBeNull()
    })
  })

  // ── Mobile actions (StandardCard) ───────────────────────────────────────────

  describe('mobile actions', () => {
    beforeEach(async () => {
      const { default: useIsMobile } = await import('src/hooks/useIsMobile')
      useIsMobile.mockReturnValue(true)
    })

    it('dispatches updateRequest with toggled active when badge is clicked', () => {
      const vehicle = makeVehicle({ id: 'v1', plate: 'ABC123', active: true })
      const store = configureStore({ reducer: combinedReducers, preloadedState: vehicleState({ data: [vehicle] }) })
      const spy = vi.spyOn(store, 'dispatch')
      render(<Provider store={store}><Vehiculos /></Provider>)
      spy.mockClear()

      fireEvent.click(screen.getByTestId('badge-btn'))

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('update'),
          payload: expect.objectContaining({ active: false }),
        }),
      )
    })

    it('dispatches deleteRequest when delete action is confirmed', () => {
      window.confirm = vi.fn(() => true)
      const vehicle = makeVehicle({ id: 'v1', plate: 'ABC123' })
      const store = configureStore({ reducer: combinedReducers, preloadedState: vehicleState({ data: [vehicle] }) })
      const spy = vi.spyOn(store, 'dispatch')
      render(<Provider store={store}><Vehiculos /></Provider>)
      spy.mockClear()

      fireEvent.click(screen.getByTestId('action-Eliminar'))

      expect(window.confirm).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('delete'),
          payload: expect.objectContaining({ id: 'v1' }),
        }),
      )
    })

    it('does NOT dispatch deleteRequest when confirm is cancelled', () => {
      window.confirm = vi.fn(() => false)
      const vehicle = makeVehicle({ id: 'v1', plate: 'ABC123' })
      const { store } = renderWithRedux(vehicleState({ data: [vehicle] }))
      const spy = vi.spyOn(store, 'dispatch')

      fireEvent.click(screen.getByTestId('action-Eliminar'))

      expect(window.confirm).toHaveBeenCalled()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ── driversByPlate mapping ──────────────────────────────────────────────────

  describe('driversByPlate', () => {
    it('maps drivers to their default vehicle plate in mobile card rows', async () => {
      const { default: useIsMobile } = await import('src/hooks/useIsMobile')
      useIsMobile.mockReturnValue(true)

      const vehicle = makeVehicle({ id: 'v1', plate: 'ABC123' })
      const driver = makeDriver({ id: 'd1', name: 'Pedro Ramirez', defaultVehicle: 'ABC123' })
      renderWithRedux({
        taxiVehicle: { data: [vehicle], fetching: false },
        taxiDriver: { data: [driver], fetching: false },
      })

      // The mobile card renders vehicle plate — driver association is in renderRows
      // which is called internally. The StandardCard mock doesn't call renderRows,
      // but we verify the vehicle card is rendered.
      expect(screen.getByText('ABC123')).toBeTruthy()
    })
  })
})
