// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@coreui/react', () => ({
  CSpinner: () => <span data-testid="spinner" />,
}))

vi.mock('src/constants/cashFlow', () => ({
  ACCOUNT_CATEGORIES: ['Gastos Fijos', 'Servicios', 'Otros'],
  PAYMENT_METHODS: ['Cash', 'Transferencia'],
}))

vi.mock('src/utils/fileHelpers', () => ({
  processAttachmentFile: vi.fn(),
}))

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

import AdHocExpenseModal from '../AdHocExpenseModal'

const baseProps = {
  year: 2024,
  month: 4,
  defaultType: 'Outcoming',
  saving: false,
  onSave: vi.fn(),
  onClose: vi.fn(),
}

const renderModal = (props = {}) => render(<AdHocExpenseModal {...baseProps} {...props} />)

describe('AdHocExpenseModal', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('create mode (no initialData)', () => {
    it('shows "Agregar movimiento del período" title', () => {
      renderModal()
      expect(screen.getByText('Agregar movimiento del período')).toBeTruthy()
    })

    it('shows Gasto and Ingreso toggle buttons', () => {
      renderModal()
      expect(screen.getByText('Gasto')).toBeTruthy()
      expect(screen.getByText('Ingreso')).toBeTruthy()
    })

    it('Gasto selected by default when defaultType is Outcoming', () => {
      renderModal({ defaultType: 'Outcoming' })
      const gastoBtn = screen.getByText('Gasto')
      expect(gastoBtn.style.fontWeight).toBe('700')
    })

    it('Ingreso selected by default when defaultType is Incoming', () => {
      renderModal({ defaultType: 'Incoming' })
      const ingresoBtn = screen.getByText('Ingreso')
      expect(ingresoBtn.style.fontWeight).toBe('700')
    })

    it('clicking Ingreso switches type', () => {
      renderModal()
      fireEvent.click(screen.getByText('Ingreso'))
      expect(screen.getByText('Ingreso').style.fontWeight).toBe('700')
    })

    it('save button disabled when description is empty', () => {
      renderModal()
      expect(screen.getByText('Guardar').disabled).toBe(true)
    })

    it('save button disabled when amount is empty', () => {
      renderModal()
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'Compra' },
      })
      expect(screen.getByText('Guardar').disabled).toBe(true)
    })

    it('save button enabled when required fields filled', () => {
      renderModal()
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'Mercado' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), {
        target: { value: '100000' },
      })
      expect(screen.getByText('Guardar').disabled).toBe(false)
    })

    it('calls onSave with correct payload on submit', () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: '  Mercado semanal  ' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), {
        target: { value: '150000' },
      })
      fireEvent.click(screen.getByText('Guardar'))
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          description: 'Mercado semanal',
          amount: 150000,
          accountMonth: '2024-04',
        }),
      )
    })

    it('payload includes type:income when Ingreso selected', () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.click(screen.getByText('Ingreso'))
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'Sueldo' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), {
        target: { value: '2000000' },
      })
      fireEvent.click(screen.getByText('Guardar'))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ type: 'income' }))
    })

    it('payload note is null when note field is empty', () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'X' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1' } })
      fireEvent.click(screen.getByText('Guardar'))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ note: null }))
    })

    it('calls onClose when Cancelar clicked', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.click(screen.getByText('Cancelar'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      const backdrop = screen.getByText('Cancelar').closest('[style*="fixed"]')
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('shows spinner in button when saving', () => {
      renderModal({ saving: true })
      expect(screen.getByTestId('spinner')).toBeTruthy()
    })

    it('renders category options', () => {
      renderModal()
      expect(screen.getByText('Gastos Fijos')).toBeTruthy()
      expect(screen.getByText('Servicios')).toBeTruthy()
    })
  })

  describe('edit mode (initialData provided)', () => {
    const initialData = {
      id: 'tx1',
      type: 'expense',
      description: 'Arriendo',
      amount: 900000,
      date: '2024-04-01',
      category: 'Gastos Fijos',
      note: 'pago mensual',
      accountMonth: '2024-04',
      attachment: null,
      attachmentName: '',
    }

    it('shows "Editar movimiento" title', () => {
      renderModal({ initialData })
      expect(screen.getByText('Editar movimiento')).toBeTruthy()
    })

    it('pre-fills description from initialData', () => {
      renderModal({ initialData })
      expect(screen.getByDisplayValue('Arriendo')).toBeTruthy()
    })

    it('pre-fills amount from initialData', () => {
      renderModal({ initialData })
      expect(screen.getByDisplayValue('900000')).toBeTruthy()
    })

    it('pre-fills note from initialData', () => {
      renderModal({ initialData })
      expect(screen.getByDisplayValue('pago mensual')).toBeTruthy()
    })

    it('payload includes id in edit mode', () => {
      const onSave = vi.fn()
      renderModal({ initialData, onSave })
      fireEvent.click(screen.getByText('Guardar'))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx1' }))
    })

    it('payload uses initialData.accountMonth', () => {
      const onSave = vi.fn()
      renderModal({ initialData, onSave })
      fireEvent.click(screen.getByText('Guardar'))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ accountMonth: '2024-04' }))
    })
  })
})
