// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@coreui/react', () => ({
  CButton: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  CSpinner: ({ size }) => <span data-testid={`spinner-${size}`} />,
}))

vi.mock('src/constants/cashFlow', () => ({
  EXPENSE_CATEGORIES: ['Alimentación', 'Transporte', 'Hogar'],
  INCOME_CATEGORIES: ['Salario', 'Freelance'],
  PAYMENT_METHODS: ['Cash', 'Transferencia'],
}))

vi.mock('src/constants/commons', () => ({
  MONTH_NAMES: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
}))

import TransactionForm from '../TransactionForm'

const mockOnSave = vi.fn()
const mockOnCancel = vi.fn()

const renderForm = (props = {}) =>
  render(
    <TransactionForm
      saving={false}
      onSave={mockOnSave}
      onCancel={mockOnCancel}
      {...props}
    />,
  )

describe('TransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create mode', () => {
    it('renders "Nueva transacción" title', () => {
      renderForm()
      expect(screen.getByText('Nueva transacción')).toBeTruthy()
    })

    it('renders type, category, description, amount, date and payment method fields', () => {
      renderForm()
      expect(screen.getByText('Tipo')).toBeTruthy()
      expect(screen.getByText('Categoría')).toBeTruthy()
      expect(screen.getByText('Descripción')).toBeTruthy()
      expect(screen.getByText('Monto (COP)')).toBeTruthy()
      expect(screen.getByText('Fecha')).toBeTruthy()
      expect(screen.getByText('Método de pago')).toBeTruthy()
    })

    it('shows expense categories by default', () => {
      renderForm()
      expect(screen.getByText('Alimentación')).toBeTruthy()
      expect(screen.getByText('Transporte')).toBeTruthy()
      expect(screen.queryByText('Salario')).toBeNull()
    })

    it('switches to income categories when type changes to income', () => {
      renderForm()
      const typeSelect = screen.getByDisplayValue('Gasto')
      fireEvent.change(typeSelect, { target: { value: 'income' } })
      expect(screen.getByText('Salario')).toBeTruthy()
      expect(screen.getByText('Freelance')).toBeTruthy()
    })

    it('clears category when switching type', () => {
      renderForm()
      const categorySelect = screen.getByDisplayValue('Sin categoría')
      fireEvent.change(categorySelect, { target: { value: 'Alimentación' } })
      const typeSelect = screen.getByDisplayValue('Gasto')
      fireEvent.change(typeSelect, { target: { value: 'income' } })
      expect(screen.getByDisplayValue('Sin categoría')).toBeTruthy()
    })
  })

  describe('edit mode', () => {
    const existing = {
      id: 'tx-1',
      type: 'income',
      category: 'Salario',
      description: 'Pago mes',
      amount: 2000000,
      date: '2026-04-01',
      paymentMethod: 'Transferencia',
    }

    it('renders "Editar transacción" title', () => {
      renderForm({ initial: existing })
      expect(screen.getByText('Editar transacción')).toBeTruthy()
    })

    it('pre-fills fields with initial values', () => {
      renderForm({ initial: existing })
      expect(screen.getByDisplayValue('Pago mes')).toBeTruthy()
      expect(screen.getByDisplayValue('2000000')).toBeTruthy()
      expect(screen.getByDisplayValue('2026-04-01')).toBeTruthy()
    })
  })

  describe('account master info', () => {
    it('shows account master name when present in initial', () => {
      renderForm({
        initial: {
          accountMasterName: 'Arriendo Oficina',
          type: 'expense',
          category: '',
          amount: '',
          date: '2026-04-01',
        },
      })
      expect(screen.getByText('Arriendo Oficina')).toBeTruthy()
      expect(screen.getByText('Cuenta maestra')).toBeTruthy()
    })

    it('shows star for important account master', () => {
      renderForm({
        initial: {
          accountMasterName: 'Arriendo',
          accountMasterImportant: true,
          type: 'expense',
          category: '',
          amount: '',
          date: '2026-04-01',
        },
      })
      expect(screen.getByText('★')).toBeTruthy()
    })
  })

  describe('save', () => {
    it('calls onSave with numeric amount stripped of non-digits', () => {
      renderForm()
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '150000' } })
      fireEvent.change(screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/)[0], {
        target: { value: '2026-04-17' },
      })
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 150000, date: '2026-04-17' }),
      )
    })

    it('does not call onSave when amount is empty', () => {
      renderForm()
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('does not call onSave when date is empty', () => {
      renderForm()
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100' } })
      fireEvent.change(screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/)[0], {
        target: { value: '' },
      })
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('cancel', () => {
    it('calls onCancel when Cancel is clicked', () => {
      renderForm()
      fireEvent.click(screen.getByText('Cancelar'))
      expect(mockOnCancel).toHaveBeenCalledOnce()
    })
  })

  describe('saving state', () => {
    it('disables buttons when saving=true', () => {
      renderForm({ saving: true })
      const buttons = screen.getAllByRole('button')
      buttons.forEach((b) => expect(b.disabled).toBe(true))
    })

    it('shows spinner instead of Guardar text when saving', () => {
      renderForm({ saving: true })
      expect(screen.getByTestId('spinner-sm')).toBeTruthy()
      expect(screen.queryByText('Guardar')).toBeNull()
    })
  })
})
