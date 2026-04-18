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
  CSpinner: ({ color }) => <span data-testid={`spinner-${color ?? 'default'}`} />,
  CCard: ({ children }) => <div>{children}</div>,
  CCardBody: ({ children }) => <div>{children}</div>,
  CCardHeader: ({ children }) => <div>{children}</div>,
  CModal: ({ visible, children }) => (visible ? <div data-testid="modal">{children}</div> : null),
  CModalBody: ({ children }) => <div>{children}</div>,
  CModalHeader: ({ children }) => <div>{children}</div>,
  CModalTitle: ({ children }) => <div>{children}</div>,
}))

vi.mock('devextreme-react/data-grid', () => ({
  Column: () => null,
  Summary: () => null,
  TotalItem: () => null,
}))

vi.mock('src/components/shared/StandardGrid/Index', () => ({
  default: ({ dataSource }) => (
    <div data-testid="standard-grid" data-count={dataSource?.length ?? 0} />
  ),
}))

vi.mock('src/components/shared/AttachmentViewer', () => ({
  default: ({ onClose }) => (
    <div data-testid="attachment-viewer">
      <button onClick={onClose}>Cerrar viewer</button>
    </div>
  ),
}))

vi.mock('src/utils/fileHelpers', () => ({ processAttachmentFile: vi.fn() }))

const mockDispatch = vi.fn()
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(),
}))

vi.mock('src/actions/cashflow/transactionActions', () => ({
  fetchRequest: vi.fn((p) => ({ type: 'TX_FETCH', payload: p })),
  createRequest: vi.fn((p) => ({ type: 'TX_CREATE', payload: p })),
  updateRequest: vi.fn((p) => ({ type: 'TX_UPDATE', payload: p })),
  deleteRequest: vi.fn((p) => ({ type: 'TX_DELETE', payload: p })),
}))

vi.mock('src/actions/cashflow/accountsMasterActions', () => ({
  fetchRequest: vi.fn(() => ({ type: 'MASTER_FETCH' })),
}))

vi.mock('src/constants/cashFlow', () => ({
  EXPENSE_CATEGORIES: ['Alimentación', 'Transporte'],
  INCOME_CATEGORIES: ['Salario', 'Freelance'],
}))

vi.mock('src/constants/commons', () => ({
  MONTH_NAMES: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
}))

vi.mock('../SummaryCard', () => ({
  default: ({ label, value }) => (
    <div data-testid={`summary-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
  ),
}))

vi.mock('../TransactionForm', () => ({
  default: ({ onSave, onCancel }) => (
    <div data-testid="transaction-form">
      <button onClick={() => onSave({ type: 'expense', amount: 100, date: '2026-04-17' })}>
        Guardar
      </button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}))

vi.mock('../MigrationModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="migration-modal">
      <button onClick={onClose}>Cerrar migración</button>
    </div>
  ),
}))

vi.mock('../MaestroRow', () => ({
  default: ({ account, onPay }) => (
    <tr data-testid={`maestro-row-${account.id}`}>
      <td>
        <button onClick={() => onPay(account)}>Pagar {account.name}</button>
      </td>
    </tr>
  ),
}))

vi.mock('../AnnualView', () => ({
  default: () => <div data-testid="annual-view" />,
}))

vi.mock('../../movements/payments/Payments.scss', () => ({}))
vi.mock('../../movements/payments/ItemDetail.scss', () => ({}))

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useSelector } from 'react-redux'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import Transactions from '../index'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1
const monthStr = `${CURRENT_YEAR}-${String(CURRENT_MONTH).padStart(2, '0')}`

const masterA = {
  id: 'master-1',
  name: 'Arriendo',
  type: 'Outcoming',
  active: true,
  period: 'Mensuales',
  defaultValue: 500000,
  maxDatePay: 5,
  category: 'Gastos Fijos',
}

const txFree = {
  id: 'tx-free-1',
  type: 'expense',
  category: 'Alimentación',
  description: 'Mercado',
  amount: 80000,
  date: `${monthStr}-10`,
}

const txFreeIncome = {
  id: 'tx-free-2',
  type: 'income',
  category: 'Salario',
  description: 'Pago mes',
  amount: 3000000,
  date: `${monthStr}-01`,
}

const defaultStore = {
  transaction: { data: [], fetching: false, saving: false },
  accountsMaster: { data: [], fetching: false },
}

const setupStore = (overrides = {}) => {
  useSelector.mockImplementation((selector) =>
    selector({
      transaction: { ...defaultStore.transaction, ...(overrides.transaction ?? {}) },
      accountsMaster: { ...defaultStore.accountsMaster, ...(overrides.accountsMaster ?? {}) },
    }),
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupStore()
  })

  describe('data fetching', () => {
    it('dispatches fetchRequest for transactions on mount', () => {
      render(<Transactions />)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'TX_FETCH', payload: { year: CURRENT_YEAR } }),
      )
    })

    it('dispatches accountsMaster fetchRequest when masters is null', () => {
      setupStore({ accountsMaster: { data: null, fetching: false } })
      render(<Transactions />)
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'MASTER_FETCH' }))
    })

    it('does not dispatch accountsMaster fetchRequest when masters already loaded', () => {
      setupStore({ accountsMaster: { data: [masterA], fetching: false } })
      render(<Transactions />)
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MASTER_FETCH' }),
      )
    })

    it('shows spinner in maestro tab when fetching masters with no data', () => {
      setupStore({ accountsMaster: { data: null, fetching: true } })
      render(<Transactions />)
      expect(screen.getByTestId('spinner-primary')).toBeTruthy()
    })

    it('shows spinner in transactions tab when fetching with no data', () => {
      setupStore({ transaction: { data: null, fetching: true, saving: false } })
      render(<Transactions />)
      fireEvent.click(screen.getByText('Otras transacciones'))
      expect(screen.getByTestId('spinner-primary')).toBeTruthy()
    })
  })

  describe('summary cards', () => {
    it('renders "Pendientes del maestro" summary card', () => {
      setupStore({
        transaction: { data: [], fetching: false, saving: false },
        accountsMaster: { data: [masterA], fetching: false },
      })
      render(<Transactions />)
      expect(screen.getByTestId('summary-pendientes-del-maestro')).toBeTruthy()
    })

    it('renders "Cuentas maestras pagadas" summary card', () => {
      render(<Transactions />)
      expect(screen.getByTestId('summary-cuentas-maestras-pagadas')).toBeTruthy()
    })
  })

  describe('tabs', () => {
    it('shows maestro tab content by default', () => {
      setupStore({
        transaction: { data: [], fetching: false, saving: false },
        accountsMaster: { data: [masterA], fetching: false },
      })
      render(<Transactions />)
      expect(screen.getByTestId('maestro-row-master-1')).toBeTruthy()
    })

    it('switches to "Otras transacciones" tab and shows grid', () => {
      setupStore({
        transaction: { data: [txFree], fetching: false, saving: false },
        accountsMaster: { data: [], fetching: false },
      })
      render(<Transactions />)
      fireEvent.click(screen.getByText('Otras transacciones'))
      expect(screen.getByTestId('standard-grid')).toBeTruthy()
    })

    it('switches to Anual tab and renders AnnualView', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText(`Anual ${CURRENT_YEAR}`))
      expect(screen.getByTestId('annual-view')).toBeTruthy()
    })
  })

  describe('transaction form modal', () => {
    it('opens create form when + Nueva transacción is clicked', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('+ Nueva transacción'))
      expect(screen.getByTestId('modal')).toBeTruthy()
      expect(screen.getByTestId('transaction-form')).toBeTruthy()
    })

    it('opens pay form when Pagar is clicked on a maestro row', () => {
      setupStore({
        transaction: { data: [], fetching: false, saving: false },
        accountsMaster: { data: [masterA], fetching: false },
      })
      render(<Transactions />)
      fireEvent.click(screen.getByText(`Pagar ${masterA.name}`))
      expect(screen.getByTestId('modal')).toBeTruthy()
    })

    it('dispatches createRequest and closes modal on save', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('+ Nueva transacción'))
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TX_CREATE' }))
      expect(screen.queryByTestId('modal')).toBeNull()
    })

    it('closes modal on cancel', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('+ Nueva transacción'))
      fireEvent.click(screen.getByText('Cancelar'))
      expect(screen.queryByTestId('modal')).toBeNull()
    })
  })

  describe('migration modal', () => {
    it('opens migration modal when ↓ Migrar legado is clicked', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('↓ Migrar legado'))
      expect(screen.getByTestId('migration-modal')).toBeTruthy()
    })

    it('closes migration modal when closed', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('↓ Migrar legado'))
      fireEvent.click(screen.getByText('Cerrar migración'))
      expect(screen.queryByTestId('migration-modal')).toBeNull()
    })
  })

  describe('free transactions filtering', () => {
    beforeEach(() => {
      setupStore({
        transaction: { data: [txFree, txFreeIncome], fetching: false, saving: false },
        accountsMaster: { data: [], fetching: false },
      })
    })

    it('shows all transactions by default', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('Otras transacciones'))
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(2)
    })

    it('filters by expense type', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('Otras transacciones'))
      fireEvent.change(screen.getByDisplayValue('Tipo: Todos'), { target: { value: 'expense' } })
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(1)
    })

    it('filters by income type', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('Otras transacciones'))
      fireEvent.change(screen.getByDisplayValue('Tipo: Todos'), { target: { value: 'income' } })
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(1)
    })

    it('shows clear filter button when type filter is active', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('Otras transacciones'))
      fireEvent.change(screen.getByDisplayValue('Tipo: Todos'), { target: { value: 'expense' } })
      expect(screen.getByText('✕ Limpiar')).toBeTruthy()
    })

    it('resets type filter on ✕ Limpiar click', () => {
      render(<Transactions />)
      fireEvent.click(screen.getByText('Otras transacciones'))
      fireEvent.change(screen.getByDisplayValue('Tipo: Todos'), { target: { value: 'expense' } })
      fireEvent.click(screen.getByText('✕ Limpiar'))
      expect(Number(screen.getByTestId('standard-grid').dataset.count)).toBe(2)
    })
  })

  describe('maestro pending count', () => {
    it('shows 0 pending when all masters have payments in current month', () => {
      const txMasterPaid = {
        id: 'tx-m-1',
        type: 'expense',
        accountMasterId: 'master-1',
        amount: 500000,
        date: `${monthStr}-05`,
      }
      setupStore({
        transaction: { data: [txMasterPaid], fetching: false, saving: false },
        accountsMaster: { data: [masterA], fetching: false },
      })
      render(<Transactions />)
      const card = screen.getByTestId('summary-pendientes-del-maestro')
      expect(card.textContent).toBe('0')
    })

    it('shows 1 pending when master has no payment this month', () => {
      setupStore({
        transaction: { data: [], fetching: false, saving: false },
        accountsMaster: { data: [masterA], fetching: false },
      })
      render(<Transactions />)
      const card = screen.getByTestId('summary-pendientes-del-maestro')
      expect(card.textContent).toBe('1')
    })
  })
})
