// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@coreui/react', () => ({
  CSpinner: ({ color }) => <span data-testid={`spinner-${color ?? 'default'}`} />,
}))

vi.mock('@coreui/icons-react', () => ({ default: () => null }))
vi.mock('@coreui/icons', () => ({ cilCalendar: null }))

vi.mock('src/utils/moment', () => {
  const months = [
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
  ]
  return { default: { localeData: () => ({ months: () => months }) } }
})

vi.mock('src/hooks/useLocaleData', () => ({
  default: () => ({
    monthLabels: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  }),
}))

vi.mock('src/components/shared/AttachmentViewer', () => ({
  default: ({ onClose }) => (
    <div data-testid="attachment-viewer">
      <button onClick={onClose}>Cerrar viewer</button>
    </div>
  ),
}))

vi.mock('src/utils/fileHelpers', () => ({
  processAttachmentFile: vi.fn(),
}))

const mockDispatch = vi.fn()
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(),
}))

const mockSetSearchParams = vi.fn()
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}))

vi.mock('src/actions/cashflow/transactionActions', () => ({
  fetchRequest: vi.fn((p) => ({ type: 'TX_FETCH', payload: p })),
  createRequest: vi.fn((p) => ({ type: 'TX_CREATE', payload: p })),
  updateRequest: vi.fn((p) => ({ type: 'TX_UPDATE', payload: p })),
  deleteRequest: vi.fn((p) => ({ type: 'TX_DELETE', payload: p })),
}))

vi.mock('src/actions/cashflow/accountsMasterActions', () => ({
  fetchRequest: vi.fn(() => ({ type: 'ACC_FETCH' })),
  createRequest: vi.fn((p) => ({ type: 'ACC_CREATE', payload: p })),
  updateRequest: vi.fn((p) => ({ type: 'ACC_UPDATE', payload: p })),
}))

vi.mock('src/actions/cashflow/accountStatusNoteActions', () => ({
  fetchRequest: vi.fn((p) => ({ type: 'NOTE_FETCH', payload: p })),
  createRequest: vi.fn((p) => ({ type: 'NOTE_CREATE', payload: p })),
  updateRequest: vi.fn((p) => ({ type: 'NOTE_UPDATE', payload: p })),
  deleteRequest: vi.fn((p) => ({ type: 'NOTE_DELETE', payload: p })),
}))

vi.mock('../../OcrReceiptImporter', () => ({
  default: () => <div data-testid="ocr-importer" />,
}))

// Stub sub-components — index tests focus on orchestration, not sub-component rendering
vi.mock('../DetailModal', () => ({
  default: ({ onClose, onUpdate, onClone }) => (
    <div data-testid="detail-modal">
      <button onClick={onClose}>Close Detail</button>
      <button onClick={() => onUpdate({ id: 'acc1', name: 'Updated' })}>Save</button>
      <button onClick={() => onClone({ id: 'acc1' })}>Clone</button>
    </div>
  ),
}))

vi.mock('../PayModal', () => ({
  default: ({ onClose, onSave }) => (
    <div data-testid="pay-modal">
      <button onClick={onClose}>Close Pay</button>
      <button onClick={() => onSave({ amount: 100 })}>Save Pay</button>
    </div>
  ),
}))

vi.mock('../AccountCard', () => ({
  default: ({ account, onDetail, onPay, onDelete, onUpdate, onViewAttachment }) => (
    <div data-testid={`card-${account.id}`}>
      <button onClick={() => onDetail(account)}>Detail {account.name}</button>
      <button onClick={() => onPay(account)}>Pay {account.name}</button>
      <button onClick={() => onDelete({ id: 'pay1', amount: 1000 })}>Delete Pay</button>
      <button onClick={() => onUpdate({ id: 'pay1', amount: 2000 })}>Update Pay</button>
      <button onClick={() => onViewAttachment('data:img', 'receipt.png')}>
        View Attachment {account.name}
      </button>
    </div>
  ),
}))

vi.mock('../AdHocExpenseModal', () => ({
  default: ({ onClose, onSave, initialData }) => (
    <div data-testid={initialData ? 'adhoc-edit-modal' : 'adhoc-add-modal'}>
      <button onClick={onClose}>Close AdHoc</button>
      <button onClick={() => onSave({ description: 'test', amount: 50000 })}>Save AdHoc</button>
    </div>
  ),
}))

vi.mock('../AdHocSection', () => ({
  default: ({ onAdd, onEdit }) => (
    <div data-testid="adhoc-section">
      <button onClick={onAdd}>+ Agregar</button>
      <button onClick={() => onEdit({ id: 'tx1', description: 'x' })}>Edit AdHoc</button>
    </div>
  ),
}))

vi.mock('../PeriodNotes', () => ({
  default: ({ onAdd, onToggle, onDelete }) => (
    <div data-testid="period-notes">
      <button onClick={() => onAdd('test note')}>Add Note</button>
      <button onClick={() => onToggle({ id: 'n1', checked: false })}>Toggle Note</button>
      <button onClick={() => onDelete({ id: 'n1' })}>Delete Note</button>
    </div>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import * as accountStatusNoteActions from 'src/actions/cashflow/accountStatusNoteActions'
import AccountStatus from '../index'

const MONTH_ACCOUNT = {
  id: 'acc1',
  name: 'Arriendo',
  type: 'Outcoming',
  active: true,
  period: 'Mensuales',
  monthStartAt: 'January',
  defaultValue: 800000,
  maxDatePay: 5,
  targetAmount: 0,
  category: 'Gastos Fijos',
  important: false,
  classification: 'indispensable',
}

const PAID_ACCOUNT = {
  id: 'acc2',
  name: 'Internet',
  type: 'Outcoming',
  active: true,
  period: 'Mensuales',
  monthStartAt: 'January',
  defaultValue: 100000,
  maxDatePay: 5,
  targetAmount: 0,
  category: 'Servicios',
  important: false,
  classification: 'indispensable',
}

const PAYMENT_FOR_ACC2 = {
  id: 'pay-acc2',
  accountMasterId: 'acc2',
  accountMonth: '2024-04',
  amount: 100000,
}

const defaultStore = {
  transaction: { data: [], fetching: false, saving: false },
  accountsMaster: { data: [MONTH_ACCOUNT], fetching: false, saving: false },
  accountStatusNote: { notes: [], fetching: false, saving: false },
  profile: { data: { tenantId: 'test-tenant' }, fetching: false },
}

const setupSearchParams = (params = {}) => {
  const sp = new URLSearchParams({ tab: 'Outcoming', month: '4', year: '2024', ...params })
  useSearchParams.mockReturnValue([sp, mockSetSearchParams])
}

const setupStore = (overrides = {}) => {
  useSelector.mockImplementation((selector) =>
    selector({
      transaction: { ...defaultStore.transaction, ...(overrides.transaction ?? {}) },
      accountsMaster: { ...defaultStore.accountsMaster, ...(overrides.accountsMaster ?? {}) },
      accountStatusNote: {
        ...defaultStore.accountStatusNote,
        ...(overrides.accountStatusNote ?? {}),
      },
      profile: { ...defaultStore.profile, ...(overrides.profile ?? {}) },
    }),
  )
}

const renderComponent = () => render(<AccountStatus />)

describe('AccountStatus (index)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupSearchParams()
    setupStore()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  describe('loading state', () => {
    it('shows spinner when transactions are fetching and not yet loaded', () => {
      setupStore({ transaction: { data: null, fetching: true, saving: false } })
      renderComponent()
      expect(screen.getByTestId('spinner-primary')).toBeTruthy()
    })

    it('does not show spinner when data is available', () => {
      renderComponent()
      expect(screen.queryByTestId('spinner-primary')).toBeNull()
    })
  })

  describe('mount effects', () => {
    it('dispatches transactionActions.fetchRequest on mount', () => {
      renderComponent()
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TX_FETCH' }))
    })

    it('dispatches accountsMasterActions.fetchRequest when masters is null', () => {
      setupStore({ accountsMaster: { data: null, fetching: false, saving: false } })
      renderComponent()
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ACC_FETCH' }))
    })

    it('does not re-fetch masters when data is already loaded', () => {
      renderComponent()
      const accFetchCalls = mockDispatch.mock.calls.filter((c) => c[0]?.type === 'ACC_FETCH')
      expect(accFetchCalls.length).toBe(0)
    })

    it('dispatches accountStatusNoteActions.fetchRequest with monthStr', () => {
      renderComponent()
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'NOTE_FETCH', payload: { period: '2024-04' } }),
      )
    })
  })

  describe('type tabs', () => {
  it('renders Egresos and Ingresos tabs', () => {
    renderComponent()
    expect(screen.getByText('Egresos')).toBeTruthy()
    expect(screen.getByText('Ingresos')).toBeTruthy()
  })

  it('Egresos tab is active by default', () => {
    renderComponent()
    const egresosBtn = screen.getByText('Egresos')
    expect(egresosBtn.className).toContain('tab-btn--active')
  })

  it('Ingresos tab active when tab param is Incoming', () => {
    setupSearchParams({ tab: 'Incoming' })
    renderComponent()
    expect(screen.getByText('Ingresos').className).toContain('tab-btn--active')
  })
  })
  describe('month navigator', () => {
    it('shows current month label', () => {
      renderComponent()
      expect(screen.getByText('Abril')).toBeTruthy()
    })

    it('shows year', () => {
      renderComponent()
      expect(screen.getByText('2024')).toBeTruthy()
    })

    it('renders prev and next navigation buttons', () => {
      renderComponent()
      expect(screen.getByText('‹')).toBeTruthy()
      expect(screen.getByText('›')).toBeTruthy()
    })
  })

  describe('account list', () => {
    it('renders AccountCard for each applicable account', () => {
      renderComponent()
      expect(screen.getByTestId('card-acc1')).toBeTruthy()
    })

    it('shows "No hay cuentas" when no masters loaded', () => {
      setupStore({ accountsMaster: { data: [], fetching: false, saving: false } })
      renderComponent()
      expect(screen.getByText('No hay cuentas configuradas para este mes.')).toBeTruthy()
    })

    it('renders AdHocSection', () => {
      renderComponent()
      expect(screen.getByTestId('adhoc-section')).toBeTruthy()
    })

    it('renders PeriodNotes when not fetching', () => {
      renderComponent()
      expect(screen.getByTestId('period-notes')).toBeTruthy()
    })

    it('renders OCR importer', () => {
      renderComponent()
      expect(screen.getByTestId('ocr-importer')).toBeTruthy()
    })
  })

  describe('filter tabs', () => {
    it('renders Todas, Sin pagar, Pagadas filter buttons', () => {
      renderComponent()
      expect(screen.getByText(/Todas \(/)).toBeTruthy()
      expect(screen.getByText(/Sin pagar \(/)).toBeTruthy()
      expect(screen.getByText(/Pagadas \(/)).toBeTruthy()
    })
  })

  describe('summary strip', () => {
    it('shows Pagadas, Pendientes, Vencidas counts', () => {
      renderComponent()
      expect(screen.getByText('Pagadas')).toBeTruthy()
      expect(screen.getByText('Pendientes')).toBeTruthy()
      expect(screen.getByText('Vencidas')).toBeTruthy()
    })
  })

  describe('pay flow', () => {
    it('opens PayModal when Pagar clicked on card', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Pay Arriendo'))
      expect(screen.getByTestId('pay-modal')).toBeTruthy()
    })

    it('closes PayModal on close action', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Pay Arriendo'))
      fireEvent.click(screen.getByText('Close Pay'))
      expect(screen.queryByTestId('pay-modal')).toBeNull()
    })

    it('dispatches createRequest when pay saved', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Pay Arriendo'))
      fireEvent.click(screen.getByText('Save Pay'))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TX_CREATE' }))
    })
  })

  describe('detail flow', () => {
    it('opens DetailModal when Detail clicked on card', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Detail Arriendo'))
      expect(screen.getByTestId('detail-modal')).toBeTruthy()
    })

    it('closes DetailModal on close action', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Detail Arriendo'))
      fireEvent.click(screen.getByText('Close Detail'))
      expect(screen.queryByTestId('detail-modal')).toBeNull()
    })

    it('dispatches updateRequest and closes when account saved', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Detail Arriendo'))
      fireEvent.click(screen.getByText('Save'))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ACC_UPDATE' }))
      expect(screen.queryByTestId('detail-modal')).toBeNull()
    })

    it('dispatches createRequest when account cloned', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Detail Arriendo'))
      fireEvent.click(screen.getByText('Clone'))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ACC_CREATE' }))
    })
  })

  describe('ad-hoc flow', () => {
    it('opens AdHocExpenseModal when + Agregar clicked in section', () => {
      renderComponent()
      fireEvent.click(screen.getByText('+ Agregar'))
      expect(screen.getByTestId('adhoc-add-modal')).toBeTruthy()
    })

    it('dispatches createRequest when ad-hoc saved', () => {
      renderComponent()
      fireEvent.click(screen.getByText('+ Agregar'))
      fireEvent.click(screen.getByText('Save AdHoc'))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TX_CREATE' }))
    })

    it('opens edit modal when Edit AdHoc clicked', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Edit AdHoc'))
      expect(screen.getByTestId('adhoc-edit-modal')).toBeTruthy()
    })

    it('dispatches updateRequest when ad-hoc edit saved', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Edit AdHoc'))
      fireEvent.click(screen.getByText('Save AdHoc'))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TX_UPDATE' }))
    })
  })

  describe('delete payment', () => {
    it('dispatches deleteRequest after confirm', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Delete Pay'))
      expect(window.confirm).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TX_DELETE' }))
    })

    it('does not dispatch when confirm is cancelled', () => {
      window.confirm.mockReturnValue(false)
      renderComponent()
      fireEvent.click(screen.getByText('Delete Pay'))
      const deleteCalls = mockDispatch.mock.calls.filter((c) => c[0]?.type === 'TX_DELETE')
      expect(deleteCalls.length).toBe(0)
    })
  })

  describe('update payment', () => {
    it('dispatches updateRequest when payment edited in card', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Update Pay'))
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'TX_UPDATE' }))
    })
  })

  describe('month navigation logic', () => {
    it('clicking ‹ calls setSearchParams', () => {
      renderComponent()
      mockSetSearchParams.mockClear()
      fireEvent.click(screen.getByText('‹'))
      expect(mockSetSearchParams).toHaveBeenCalled()
    })

    it('clicking › calls setSearchParams', () => {
      renderComponent()
      mockSetSearchParams.mockClear()
      fireEvent.click(screen.getByText('›'))
      expect(mockSetSearchParams).toHaveBeenCalled()
    })

    it('clicking ‹ decrements month by one', () => {
      renderComponent()
      mockSetSearchParams.mockClear()
      fireEvent.click(screen.getByText('‹'))
      const fn = mockSetSearchParams.mock.calls[0][0]
      const sp = new URLSearchParams({ tab: 'Outcoming', month: '4', year: '2024' })
      fn(sp)
      expect(sp.get('month')).toBe('3')
    })

    it('clicking › increments month by one', () => {
      renderComponent()
      mockSetSearchParams.mockClear()
      fireEvent.click(screen.getByText('›'))
      const fn = mockSetSearchParams.mock.calls[0][0]
      const sp = new URLSearchParams({ tab: 'Outcoming', month: '4', year: '2024' })
      fn(sp)
      expect(sp.get('month')).toBe('5')
    })

    it('clicking ‹ when month=1 sets month=12 and decrements year', () => {
      setupSearchParams({ tab: 'Outcoming', month: '1', year: '2024' })
      renderComponent()
      mockSetSearchParams.mockClear()
      fireEvent.click(screen.getByText('‹'))
      const fn = mockSetSearchParams.mock.calls[0][0]
      const sp = new URLSearchParams({ tab: 'Outcoming', month: '1', year: '2024' })
      fn(sp)
      expect(sp.get('month')).toBe('12')
      expect(sp.get('year')).toBe('2023')
    })

    it('clicking › when month=12 sets month=1 and increments year', () => {
      setupSearchParams({ tab: 'Outcoming', month: '12', year: '2024' })
      renderComponent()
      mockSetSearchParams.mockClear()
      fireEvent.click(screen.getByText('›'))
      const fn = mockSetSearchParams.mock.calls[0][0]
      const sp = new URLSearchParams({ tab: 'Outcoming', month: '12', year: '2024' })
      fn(sp)
      expect(sp.get('month')).toBe('1')
      expect(sp.get('year')).toBe('2025')
    })
  })

  describe('filter behavior', () => {
    it('filter=paid shows only Pagado accounts and hides others', () => {
      setupStore({
        accountsMaster: { data: [MONTH_ACCOUNT, PAID_ACCOUNT], fetching: false, saving: false },
        transaction: { data: [PAYMENT_FOR_ACC2], fetching: false, saving: false },
      })
      renderComponent()
      fireEvent.click(screen.getByText(/Pagadas \(/))
      expect(screen.queryByTestId('card-acc1')).toBeNull()
      expect(screen.getByTestId('card-acc2')).toBeTruthy()
    })

    it('filter=pending shows only non-paid accounts and hides paid ones', () => {
      setupStore({
        accountsMaster: { data: [MONTH_ACCOUNT, PAID_ACCOUNT], fetching: false, saving: false },
        transaction: { data: [PAYMENT_FOR_ACC2], fetching: false, saving: false },
      })
      renderComponent()
      fireEvent.click(screen.getByText(/Sin pagar \(/))
      expect(screen.getByTestId('card-acc1')).toBeTruthy()
      expect(screen.queryByTestId('card-acc2')).toBeNull()
    })

    it('shows "Sin cuentas en este filtro" when filter matches nothing', () => {
      renderComponent()
      fireEvent.click(screen.getByText(/Pagadas \(/))
      expect(screen.getByText('Sin cuentas en este filtro.')).toBeTruthy()
    })

    it('switching back to Todas shows all accounts', () => {
      setupStore({
        accountsMaster: { data: [MONTH_ACCOUNT, PAID_ACCOUNT], fetching: false, saving: false },
        transaction: { data: [PAYMENT_FOR_ACC2], fetching: false, saving: false },
      })
      renderComponent()
      fireEvent.click(screen.getByText(/Pagadas \(/))
      fireEvent.click(screen.getByText(/Todas \(/))
      expect(screen.getByTestId('card-acc1')).toBeTruthy()
      expect(screen.getByTestId('card-acc2')).toBeTruthy()
    })
  })

  describe('summary strip totals', () => {
    it('renders Total: label', () => {
      renderComponent()
      expect(screen.getByText('Total:')).toBeTruthy()
    })
  })

  describe('balance strip', () => {
    it('shows Ingresos − Egresos strip when expenses exist', () => {
      renderComponent()
      expect(screen.getByText('Ingresos − Egresos')).toBeTruthy()
    })

    it('shows a negative balance when expenses exceed income', () => {
      renderComponent()
      const balanceEl = screen.getAllByText((text) => text.startsWith('-') && text.includes('$'))
      expect(balanceEl.length).toBeGreaterThan(0)
    })
  })

  describe('note handlers', () => {
    it('dispatches NOTE_CREATE when note added via PeriodNotes', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Add Note'))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NOTE_CREATE',
          payload: { period: '2024-04', text: 'test note' },
        }),
      )
    })

    it('dispatches NOTE_UPDATE when note toggled via PeriodNotes', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Toggle Note'))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NOTE_UPDATE',
          payload: { id: 'n1', checked: true },
        }),
      )
    })

    it('dispatches NOTE_DELETE when note deleted via PeriodNotes', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Delete Note'))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NOTE_DELETE',
          payload: { id: 'n1' },
        }),
      )
    })
  })

  describe('attachment viewer', () => {
    it('opens AttachmentViewer when card triggers onViewAttachment', () => {
      renderComponent()
      fireEvent.click(screen.getByText('View Attachment Arriendo'))
      expect(screen.getByTestId('attachment-viewer')).toBeTruthy()
    })

    it('closes AttachmentViewer when viewer onClose is called', () => {
      renderComponent()
      fireEvent.click(screen.getByText('View Attachment Arriendo'))
      fireEvent.click(screen.getByText('Cerrar viewer'))
      expect(screen.queryByTestId('attachment-viewer')).toBeNull()
    })
  })

  describe('saving auto-close', () => {
    it('closes PayModal when saving transitions from true to false', () => {
      setupStore({ transaction: { data: [], fetching: false, saving: false } })
      const { rerender } = render(<AccountStatus />)

      fireEvent.click(screen.getByText('Pay Arriendo'))
      expect(screen.getByTestId('pay-modal')).toBeTruthy()

      setupStore({ transaction: { data: [], fetching: false, saving: true } })
      rerender(<AccountStatus />)
      expect(screen.getByTestId('pay-modal')).toBeTruthy()

      setupStore({ transaction: { data: [], fetching: false, saving: false } })
      rerender(<AccountStatus />)
      expect(screen.queryByTestId('pay-modal')).toBeNull()
    })

    it('closes AdHocModal when saving transitions from true to false', () => {
      setupStore({ transaction: { data: [], fetching: false, saving: false } })
      const { rerender } = render(<AccountStatus />)

      fireEvent.click(screen.getByText('+ Agregar'))
      expect(screen.getByTestId('adhoc-add-modal')).toBeTruthy()

      setupStore({ transaction: { data: [], fetching: false, saving: true } })
      rerender(<AccountStatus />)

      setupStore({ transaction: { data: [], fetching: false, saving: false } })
      rerender(<AccountStatus />)
      expect(screen.queryByTestId('adhoc-add-modal')).toBeNull()
    })
  })
})
