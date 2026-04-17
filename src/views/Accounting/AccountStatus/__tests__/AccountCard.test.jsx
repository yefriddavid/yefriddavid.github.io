// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@coreui/react', () => ({
  CSpinner: () => <span data-testid="spinner" />,
}))

vi.mock('../../InlinePaymentMethod', () => ({
  default: () => null,
}))

vi.mock('src/utils/moment', () => {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ]
  return { default: { localeData: () => ({ months: () => months }) } }
})

import AccountCard from '../AccountCard'

const FUTURE = '2099-12'
const PAST = '2020-01'

const account = {
  id: 'acc1',
  name: 'Arriendo',
  type: 'Outcoming',
  active: true,
  period: 'Mensuales',
  category: 'Gastos Fijos',
  defaultValue: 800000,
  maxDatePay: 5,
  paymentMethod: 'Transferencia',
  important: false,
  targetAmount: 0,
}

const baseProps = {
  account,
  payments: [],
  monthStr: FUTURE,
  cumulativePaid: 0,
  onPay: vi.fn(),
  onDetail: vi.fn(),
  onDelete: vi.fn(),
  onUpdate: vi.fn(),
  onViewAttachment: vi.fn(),
  onAttach: vi.fn(),
  attachingId: null,
  savingId: null,
}

const renderCard = (props = {}) => render(<AccountCard {...baseProps} {...props} />)

describe('AccountCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders account name', () => {
    renderCard()
    expect(screen.getByText('Arriendo')).toBeTruthy()
  })

  it('shows important star when account.important is true', () => {
    renderCard({ account: { ...account, important: true } })
    expect(screen.getByText(/★/)).toBeTruthy()
  })

  it('does not show star when account.important is false', () => {
    renderCard()
    expect(screen.queryByText(/★/)).toBeNull()
  })

  it('calls onDetail when account name is clicked', () => {
    const onDetail = vi.fn()
    renderCard({ onDetail })
    fireEvent.click(screen.getByText('Arriendo'))
    expect(onDetail).toHaveBeenCalledWith(account)
  })

  it('shows category badge', () => {
    renderCard()
    expect(screen.getByText('Gastos Fijos')).toBeTruthy()
  })

  it('shows default value', () => {
    renderCard()
    expect(screen.getByText(/800/)).toBeTruthy()
  })

  it('shows maxDatePay', () => {
    renderCard()
    expect(screen.getByText('día 5')).toBeTruthy()
  })

  describe('status badge', () => {
    it('shows Pendiente when nothing paid and not overdue', () => {
      renderCard({ monthStr: FUTURE })
      expect(screen.getByText('Pendiente')).toBeTruthy()
    })

    it('shows Vencido when nothing paid and overdue', () => {
      renderCard({ monthStr: PAST })
      expect(screen.getByText('Vencido')).toBeTruthy()
    })

    it('shows Pagado when payment covers defaultValue', () => {
      renderCard({ payments: [{ id: 'p1', amount: 800000 }], monthStr: FUTURE })
      expect(screen.getByText('Pagado')).toBeTruthy()
    })

    it('shows Parcial when partial payment made', () => {
      renderCard({ payments: [{ id: 'p1', amount: 300000 }], monthStr: FUTURE })
      expect(screen.getByText('Parcial')).toBeTruthy()
    })
  })

  describe('Pagar button', () => {
    it('shows Pagar when not fully paid', () => {
      renderCard({ monthStr: FUTURE })
      expect(screen.getByText('Pagar')).toBeTruthy()
    })

    it('hides Pagar when fully paid', () => {
      renderCard({ payments: [{ id: 'p1', amount: 800000 }], monthStr: FUTURE })
      expect(screen.queryByText('Pagar')).toBeNull()
    })

    it('calls onPay when Pagar clicked', () => {
      const onPay = vi.fn()
      renderCard({ onPay, monthStr: FUTURE })
      fireEvent.click(screen.getByText('Pagar'))
      expect(onPay).toHaveBeenCalledWith(account)
    })

    it('shows spinner in Pagar when savingId matches account id', () => {
      renderCard({ savingId: 'acc1', monthStr: FUTURE })
      expect(screen.getByTestId('spinner')).toBeTruthy()
      expect(screen.queryByText('Pagar')).toBeNull()
    })
  })

  describe('debt progress bar', () => {
    const debtAccount = { ...account, targetAmount: 1000000 }

    it('shows progress bar for debt accounts', () => {
      renderCard({ account: debtAccount, cumulativePaid: 400000 })
      expect(screen.getByText(/Pagado:/)).toBeTruthy()
      expect(screen.getByText(/Saldo:/)).toBeTruthy()
    })

    it('shows completion percentage', () => {
      renderCard({ account: debtAccount, cumulativePaid: 400000 })
      expect(screen.getByText('40% completado')).toBeTruthy()
    })

    it('does not show progress bar for non-debt accounts', () => {
      renderCard()
      expect(screen.queryByText(/completado/)).toBeNull()
    })
  })

  describe('payments list', () => {
    const payments = [
      { id: 'p1', amount: 200000, date: '2024-04-03', note: 'primera cuota' },
      { id: 'p2', amount: 100000, date: '2024-04-10' },
    ]

    it('renders each payment amount', () => {
      renderCard({ payments, monthStr: FUTURE })
      expect(screen.getByText(/200/)).toBeTruthy()
    })

    it('renders payment date', () => {
      renderCard({ payments, monthStr: FUTURE })
      expect(screen.getByText('2024-04-03')).toBeTruthy()
    })

    it('renders payment note', () => {
      renderCard({ payments, monthStr: FUTURE })
      expect(screen.getByText('primera cuota')).toBeTruthy()
    })

    it('shows delete button for each payment', () => {
      renderCard({ payments, monthStr: FUTURE })
      const deleteBtns = screen.getAllByTitle('Eliminar pago')
      expect(deleteBtns.length).toBe(2)
    })

    it('calls onDelete when ✕ clicked', () => {
      const onDelete = vi.fn()
      renderCard({ payments, onDelete, monthStr: FUTURE })
      fireEvent.click(screen.getAllByTitle('Eliminar pago')[0])
      expect(onDelete).toHaveBeenCalledWith(payments[0])
    })

    it('entering edit mode shows amount input', () => {
      renderCard({ payments: [payments[0]], monthStr: FUTURE })
      // Click on the amount text to edit
      fireEvent.click(screen.getByText(/200/))
      expect(screen.getByDisplayValue('200000')).toBeTruthy()
    })

    it('cancel edit returns to view mode', () => {
      renderCard({ payments: [payments[0]], monthStr: FUTURE })
      fireEvent.click(screen.getByText(/200/))
      fireEvent.click(screen.getByText('Cancelar'))
      expect(screen.queryByDisplayValue('200000')).toBeNull()
    })

    it('save edit calls onUpdate with new amount', () => {
      const onUpdate = vi.fn()
      renderCard({ payments: [payments[0]], onUpdate, monthStr: FUTURE })
      fireEvent.click(screen.getByText(/200/))
      const input = screen.getByDisplayValue('200000')
      fireEvent.change(input, { target: { value: '250000' } })
      fireEvent.click(screen.getByText('Guardar'))
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p1', amount: 250000 }),
      )
    })

    it('save button disabled when amount unchanged', () => {
      renderCard({ payments: [payments[0]], monthStr: FUTURE })
      fireEvent.click(screen.getByText(/200/))
      expect(screen.getByText('Guardar').disabled).toBe(true)
    })

    it('shows Parcial pending amount when status is Parcial', () => {
      renderCard({
        payments: [{ id: 'p1', amount: 300000 }],
        account: { ...account, defaultValue: 800000 },
        monthStr: FUTURE,
      })
      expect(screen.getByText(/Pendiente:/)).toBeTruthy()
    })

    it('shows attachment button when payment has attachment', () => {
      const payWithAttach = { ...payments[0], attachment: 'data:image/png;base64,...', attachmentName: 'rec.png' }
      renderCard({ payments: [payWithAttach], monthStr: FUTURE })
      expect(screen.getByTitle('Ver adjunto')).toBeTruthy()
    })

    it('calls onViewAttachment when attachment button clicked', () => {
      const onViewAttachment = vi.fn()
      const payWithAttach = { ...payments[0], attachment: 'data:img', attachmentName: 'f.png' }
      renderCard({ payments: [payWithAttach], onViewAttachment, monthStr: FUTURE })
      fireEvent.click(screen.getByTitle('Ver adjunto'))
      expect(onViewAttachment).toHaveBeenCalledWith('data:img', 'f.png')
    })
  })
})
