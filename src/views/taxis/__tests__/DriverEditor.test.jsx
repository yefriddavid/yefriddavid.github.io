// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import combinedReducers from 'src/reducers/combineReducers'
import DriverEditor from '../DriverEditor'
import { makeDriver, makeVehicle } from 'src/__tests__/factories'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'

vi.mock('@coreui/icons-react', () => ({ default: () => <span data-testid="icon" /> }))
vi.mock('@coreui/icons', () => ({ cilArrowLeft: 'arrow-left', cilDescription: 'description' }))
vi.mock('src/views/taxis/masters.scss', () => ({}))

const navigateMock = vi.fn()
const paramsMock = vi.fn(() => ({ id: undefined }))
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useParams: () => paramsMock(),
}))

vi.mock('src/services/facade/imageFacade', () => ({
  uploadImage: vi.fn(),
}))

vi.mock('src/components/shared/Spinner', () => ({
  default: () => <span className="spinner-mock" />,
}))

vi.mock('src/views/taxis/DriverGenDocsPanel', () => ({
  __esModule: true,
  default: ({ driver }) => <div data-testid="docs-panel">docs for {driver?.name}</div>,
}))

vi.mock('@coreui/react', () => ({
  CCard: ({ children }) => <div>{children}</div>,
  CCardBody: ({ children }) => <div>{children}</div>,
  CButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
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

const driverState = (overrides = {}) => ({
  taxiDriver: { data: [], fetching: false, isError: false, error: null, ...overrides },
  taxiVehicle: { data: [], fetching: false },
})

const renderWithRedux = (preloadedState = {}) => {
  const store = configureStore({ reducer: combinedReducers, preloadedState })
  const utils = render(
    <Provider store={store}>
      <DriverEditor />
    </Provider>,
  )
  return { ...utils, store }
}

describe('DriverEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    paramsMock.mockReturnValue({ id: undefined })
  })

  describe('create mode (/taxis/drivers/new)', () => {
    it('shows the create form with title "Nuevo conductor"', () => {
      renderWithRedux(driverState())
      expect(screen.getByTestId('form-title').textContent).toBe('Nuevo conductor')
    })

    it('navigates back to the list on cancel', () => {
      renderWithRedux(driverState())
      fireEvent.click(screen.getByText('cancel'))
      expect(navigateMock).toHaveBeenCalledWith('/taxis/drivers')
    })

    it('dispatches createRequest and navigates back on save', async () => {
      const store = configureStore({ reducer: combinedReducers, preloadedState: driverState() })
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      render(
        <Provider store={store}>
          <DriverEditor />
        </Provider>,
      )
      // fetchRequest on mount sets fetching=true, which disables the save button
      act(() => {
        store.dispatch(taxiDriverActions.successRequestFetch([]))
      })
      fireEvent.change(screen.getByPlaceholderText('Nombre completo'), {
        target: { value: 'Nuevo Conductor' },
      })
      fireEvent.change(screen.getByPlaceholderText('123456789'), {
        target: { value: '999888777' },
      })
      await act(async () => fireEvent.click(screen.getByText('save')))
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: taxiDriverActions.createRequest({}).type }),
      )
      expect(navigateMock).toHaveBeenCalledWith('/taxis/drivers')
    })

    it('shows active/inactive toggle reflecting the default active state', () => {
      renderWithRedux(driverState())
      expect(screen.getByText('✓ Activo')).toBeTruthy()
    })

    it('toggles active state when the toggle button is clicked', () => {
      renderWithRedux(driverState())
      fireEvent.click(screen.getByText('✓ Activo'))
      expect(screen.getByText('✗ Inactivo')).toBeTruthy()
    })

    it('lists vehicles in the default-vehicle select', () => {
      const vehicles = [makeVehicle({ id: 'v1', plate: 'XYZ999', brand: 'Chevrolet' })]
      renderWithRedux({ ...driverState(), taxiVehicle: { data: vehicles, fetching: false } })
      expect(screen.getByText('XYZ999 · Chevrolet')).toBeTruthy()
    })

    it('does not show the Datos/Documentos tabs while creating', () => {
      renderWithRedux(driverState())
      expect(screen.queryByText('Documentos')).toBeNull()
    })
  })

  describe('edit mode (/taxis/drivers/:id)', () => {
    it('shows a spinner while the driver list is still loading', () => {
      paramsMock.mockReturnValue({ id: 'd1' })
      renderWithRedux(driverState({ data: null, fetching: true }))
      expect(document.querySelector('.spinner-mock')).toBeTruthy()
    })

    it('shows the edit form pre-filled with the driver name once loaded', () => {
      paramsMock.mockReturnValue({ id: 'd1' })
      const drivers = [makeDriver({ id: 'd1', name: 'Pedro Ramirez' })]
      renderWithRedux(driverState({ data: drivers }))
      expect(screen.getByTestId('form-subtitle').textContent).toBe('Pedro Ramirez')
    })

    it('switches to the Documentos tab', () => {
      paramsMock.mockReturnValue({ id: 'd1' })
      const drivers = [makeDriver({ id: 'd1', name: 'Pedro Ramirez' })]
      renderWithRedux(driverState({ data: drivers }))
      fireEvent.click(screen.getByText('Documentos'))
      expect(screen.getByTestId('docs-panel').textContent).toContain('Pedro Ramirez')
    })

    it('dispatches updateRequest with the driver id on save', async () => {
      paramsMock.mockReturnValue({ id: 'd1' })
      const drivers = [makeDriver({ id: 'd1', name: 'Pedro Ramirez' })]
      const store = configureStore({
        reducer: combinedReducers,
        preloadedState: driverState({ data: drivers }),
      })
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      render(
        <Provider store={store}>
          <DriverEditor />
        </Provider>,
      )
      // fetchRequest on mount sets fetching=true, which disables the save button
      act(() => {
        store.dispatch(taxiDriverActions.successRequestFetch(drivers))
      })
      await act(async () => fireEvent.click(screen.getByText('save')))
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: taxiDriverActions.updateRequest({}).type }),
      )
      expect(navigateMock).toHaveBeenCalledWith('/taxis/drivers')
    })
  })
})
