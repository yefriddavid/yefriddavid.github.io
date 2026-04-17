// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@coreui/react', () => ({
  CButton: ({ children, onClick, disabled, color }) => (
    <button onClick={onClick} disabled={disabled} data-color={color}>
      {children}
    </button>
  ),
  CSpinner: ({ color, size }) => (
    <span data-testid={`spinner-${color ?? 'default'}-${size ?? 'md'}`} />
  ),
  CCard: ({ children, className }) => <div className={className}>{children}</div>,
  CCardBody: ({ children }) => <div>{children}</div>,
  CCardHeader: ({ children }) => <div>{children}</div>,
  CModal: ({ visible, children }) => (visible ? <div data-testid="modal">{children}</div> : null),
  CModalBody: ({ children }) => <div>{children}</div>,
  CModalHeader: ({ children }) => <div>{children}</div>,
  CModalTitle: ({ children }) => <div>{children}</div>,
}))

vi.mock('devextreme-react/data-grid', () => ({ Column: () => null }))

vi.mock('src/components/shared/StandardGrid/Index', () => ({
  default: ({ dataSource }) => (
    <div data-testid="standard-grid" data-count={dataSource?.length ?? 0} />
  ),
}))

const mockDispatch = vi.fn()
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(),
}))

vi.mock('src/actions/cashflow/accountsMasterActions', () => ({
  fetchRequest: vi.fn(() => ({ type: 'MASTER_FETCH' })),
  createRequest: vi.fn((p) => ({ type: 'MASTER_CREATE', payload: p })),
  updateRequest: vi.fn((p) => ({ type: 'MASTER_UPDATE', payload: p })),
  deleteRequest: vi.fn((p) => ({ type: 'MASTER_DELETE', payload: p })),
  seedRequest: vi.fn((p) => ({ type: 'MASTER_SEED', payload: p })),
  patchManyRequest: vi.fn((p) => ({ type: 'MASTER_PATCH', payload: p })),
}))

vi.mock('src/constants/accounting', () => ({
  ACCOUNT_MASTER_TYPES: ['Incoming', 'Outcoming', 'Activo', 'Pasivo'],
  ACCOUNT_MASTER_TYPE_LABELS: {
    Incoming: 'Ingreso',
    Outcoming: 'Egreso',
    Activo: 'Activo',
    Pasivo: 'Pasivo',
  },
  ACCOUNT_MASTER_NATURE: {
    Activo: 'Débito',
    Outcoming: 'Débito',
    Pasivo: 'Crédito',
    Incoming: 'Crédito',
  },
}))

vi.mock('src/constants/accountsMasterSeed', () => ({
  SEED_ACCOUNTS: [{ name: 'Ejemplo 1' }, { name: 'Ejemplo 2' }],
  PATCH_ACCOUNTING: [{ name: 'Arriendo', code: '5195', accountingName: 'Arrendamientos' }],
}))

vi.mock('../AccountMasterForm', () => ({
  default: ({ onSave, onCancel }) => (
    <div data-testid="account-master-form">
      <button
        onClick={() =>
          onSave({ name: 'Cuenta Nueva', type: 'Outcoming', period: 'Mensuales', active: true })
        }
      >
        Guardar
      </button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}))

vi.mock('../../movements/payments/Payments.scss', () => ({}))
vi.mock('../../movements/payments/ItemDetail.scss', () => ({}))

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useSelector } from 'react-redux'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import AccountsMaster from '../index'

const masterA = {
  id: 'master-1',
  name: 'Arriendo',
  type: 'Outcoming',
  active: true,
  period: 'Mensuales',
  accountingName: 'Arrendamientos',
}

const masterB = {
  id: 'master-2',
  name: 'Salario',
  type: 'Incoming',
  active: true,
  period: 'Mensuales',
  accountingName: 'Sueldos',
}

const masterInactive = {
  id: 'master-3',
  name: 'Antigua Deuda',
  type: 'Pasivo',
  active: false,
  period: 'Mensuales',
  accountingName: 'Préstamos',
}

const masterNoAccounting = {
  id: 'master-4',
  name: 'Arriendo',
  type: 'Outcoming',
  active: true,
  period: 'Mensuales',
  accountingName: '',
}

const defaultStore = {
  data: [masterA, masterB],
  fetching: false,
  saving: false,
  seeding: false,
  seedProgress: 0,
  patching: false,
  patchProgress: 0,
}

const setupStore = (overrides = {}) => {
  useSelector.mockImplementation((selector) =>
    selector({ accountsMaster: { ...defaultStore, ...overrides } }),
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AccountsMaster', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupStore()
  })

  describe('initial load', () => {
    it('dispatches fetchRequest on mount', () => {
      render(<AccountsMaster />)
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'MASTER_FETCH' }))
    })

    it('shows loading spinner when fetching with no data', () => {
      setupStore({ data: null, fetching: true })
      render(<AccountsMaster />)
      expect(screen.getByTestId('spinner-primary-md')).toBeTruthy()
    })

    it('renders grid with active accounts by default', () => {
      render(<AccountsMaster />)
      const grid = screen.getByTestId('standard-grid')
      expect(Number(grid.dataset.count)).toBe(2)
    })
  })

  describe('filtering', () => {
    beforeEach(() => {
      setupStore({ data: [masterA, masterB, masterInactive] })
    })

    it('shows only active accounts by default', () => {
      render(<AccountsMaster />)
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(2)
    })

    it('filters by type Outcoming', () => {
      render(<AccountsMaster />)
      fireEvent.change(screen.getByDisplayValue('Todos'), { target: { value: 'Outcoming' } })
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(1)
    })

    it('shows inactive accounts when filter changes to inactive', () => {
      render(<AccountsMaster />)
      fireEvent.change(screen.getByDisplayValue('Activas'), { target: { value: 'inactive' } })
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(1)
    })

    it('shows all accounts when active filter is set to all', () => {
      render(<AccountsMaster />)
      fireEvent.change(screen.getByDisplayValue('Activas'), { target: { value: 'all' } })
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(3)
    })

    it('filters by name search (partial, case-insensitive)', () => {
      render(<AccountsMaster />)
      fireEvent.change(screen.getByPlaceholderText('Buscar por nombre…'), {
        target: { value: 'ARRI' },
      })
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(1)
    })

    it('clears name filter shows all active again', () => {
      render(<AccountsMaster />)
      const input = screen.getByPlaceholderText('Buscar por nombre…')
      fireEvent.change(input, { target: { value: 'arri' } })
      fireEvent.change(input, { target: { value: '' } })
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(2)
    })
  })

  describe('create', () => {
    it('opens form modal when + Nueva cuenta is clicked', () => {
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText('+ Nueva cuenta'))
      expect(screen.getByTestId('modal')).toBeTruthy()
      expect(screen.getByTestId('account-master-form')).toBeTruthy()
    })

    it('dispatches createRequest on form save', () => {
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText('+ Nueva cuenta'))
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MASTER_CREATE' }),
      )
    })

    it('closes modal after save', () => {
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText('+ Nueva cuenta'))
      fireEvent.click(screen.getByText('Guardar'))
      expect(screen.queryByTestId('modal')).toBeNull()
    })

    it('closes modal on cancel', () => {
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText('+ Nueva cuenta'))
      fireEvent.click(screen.getByText('Cancelar'))
      expect(screen.queryByTestId('modal')).toBeNull()
    })
  })

  describe('seed', () => {
    it('shows seed button only when data is empty', () => {
      setupStore({ data: [] })
      render(<AccountsMaster />)
      expect(screen.getByText(/Cargar datos de ejemplo/)).toBeTruthy()
    })

    it('does not show seed button when data has accounts', () => {
      render(<AccountsMaster />)
      expect(screen.queryByText(/Cargar datos de ejemplo/)).toBeNull()
    })

    it('dispatches seedRequest after confirm', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      setupStore({ data: [] })
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText(/Cargar datos de ejemplo/))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'MASTER_SEED' }))
    })

    it('does not dispatch seedRequest when confirm is cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      setupStore({ data: [] })
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText(/Cargar datos de ejemplo/))
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MASTER_SEED' }),
      )
    })

    it('shows progress text while seeding', () => {
      setupStore({ seeding: true, seedProgress: 45 })
      render(<AccountsMaster />)
      expect(screen.getByText(/45%/)).toBeTruthy()
    })
  })

  describe('patch accounting', () => {
    it('shows patch button when any active account lacks accountingName', () => {
      setupStore({ data: [masterNoAccounting, masterB] })
      render(<AccountsMaster />)
      expect(screen.getByText(/Actualizar nombres contables/)).toBeTruthy()
    })

    it('does not show patch button when all accounts have accountingName', () => {
      render(<AccountsMaster />)
      expect(screen.queryByText(/Actualizar nombres contables/)).toBeNull()
    })

    it('dispatches patchManyRequest for matched accounts after confirm', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      // masterNoAccounting.name === 'Arriendo' matches PATCH_ACCOUNTING[0].name
      setupStore({ data: [masterNoAccounting] })
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText(/Actualizar nombres contables/))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MASTER_PATCH' }),
      )
    })

    it('alerts when no account names match patch data', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      vi.spyOn(window, 'alert').mockImplementation(() => {})
      const unmatched = { ...masterNoAccounting, name: 'Sin coincidencia' }
      setupStore({ data: [unmatched] })
      render(<AccountsMaster />)
      fireEvent.click(screen.getByText(/Actualizar nombres contables/))
      expect(window.alert).toHaveBeenCalledWith('No se encontraron cuentas para actualizar.')
    })

    it('shows progress text while patching', () => {
      setupStore({ data: [masterA, masterB], patching: true, patchProgress: 70 })
      render(<AccountsMaster />)
      expect(screen.getByText(/70%/)).toBeTruthy()
    })
  })
})
