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

vi.mock('src/constants/accounting', () => ({
  CLASSIFICATION_OPTIONS: ['dispensable', 'indispensable'],
  PERIOD_OPTIONS: ['Mensuales', 'Trimestrales', 'Cuatrimestrales', 'Semestrales', 'Anuales', 'N/A'],
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
  ACCOUNT_MASTER_CODE_PREFIX: {
    Activo: '1',
    Pasivo: '2',
    Incoming: '4',
    Outcoming: '5',
  },
}))

vi.mock('src/constants/cashFlow', () => ({
  ACCOUNT_CATEGORIES: ['Gastos Fijos', 'Servicios', 'Otros'],
  PAYMENT_METHODS: ['Cash', 'Transferencia'],
}))

vi.mock('src/constants/commons', () => ({
  MONTH_NAMES: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
}))

vi.mock('src/hooks/useLocaleData', () => ({
  default: () => ({
    monthLabels: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
  }),
}))

import AccountMasterForm from '../AccountMasterForm'

const mockOnSave = vi.fn()
const mockOnCancel = vi.fn()

const renderForm = (props = {}) =>
  render(
    <AccountMasterForm saving={false} onSave={mockOnSave} onCancel={mockOnCancel} {...props} />,
  )

describe('AccountMasterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create mode', () => {
    it('renders "Nueva cuenta maestra" title', () => {
      renderForm()
      expect(screen.getByText('Nueva cuenta maestra')).toBeTruthy()
    })

    it('renders all required fields', () => {
      renderForm()
      expect(screen.getByPlaceholderText('Nombre de la cuenta')).toBeTruthy()
      expect(screen.getByText('Tipo')).toBeTruthy()
      expect(screen.getByText('Período')).toBeTruthy()
      expect(screen.getByText('Naturaleza')).toBeTruthy()
      expect(screen.getByText('Estado')).toBeTruthy()
    })

    it('does not show month selector for Mensuales period', () => {
      renderForm()
      expect(screen.queryByText('Mes de inicio / aplica')).toBeNull()
    })

    it('shows month selector when period is Anuales', () => {
      renderForm()
      const periodSelect = screen.getByDisplayValue('Mensuales')
      fireEvent.change(periodSelect, { target: { value: 'Anuales' } })
      expect(screen.getByText('Mes de inicio / aplica')).toBeTruthy()
    })

    it('shows month selector for Trimestrales', () => {
      renderForm()
      fireEvent.change(screen.getByDisplayValue('Mensuales'), { target: { value: 'Trimestrales' } })
      expect(screen.getByText('Mes de inicio / aplica')).toBeTruthy()
    })

    it('shows month selector for Semestrales', () => {
      renderForm()
      fireEvent.change(screen.getByDisplayValue('Mensuales'), { target: { value: 'Semestrales' } })
      expect(screen.getByText('Mes de inicio / aplica')).toBeTruthy()
    })
  })

  describe('edit mode', () => {
    const existing = {
      id: 'master-1',
      name: 'Arriendo Oficina',
      type: 'Outcoming',
      period: 'Mensuales',
      classification: 'indispensable',
      category: 'Gastos Fijos',
      defaultValue: 800000,
      maxDatePay: 10,
      paymentMethod: 'Transferencia',
      active: true,
      important: false,
      code: '5195',
      accountingName: 'Arrendamientos',
      description: 'Arriendo mensual',
      notes: '',
      targetAmount: '',
      definition: '',
      monthStartAt: 'January',
    }

    it('renders "Editar cuenta maestra" title', () => {
      renderForm({ initial: existing })
      expect(screen.getByText('Editar cuenta maestra')).toBeTruthy()
    })

    it('pre-fills name field', () => {
      renderForm({ initial: existing })
      expect(screen.getByDisplayValue('Arriendo Oficina')).toBeTruthy()
    })

    it('pre-fills accounting name field', () => {
      renderForm({ initial: existing })
      expect(screen.getByDisplayValue('Arrendamientos')).toBeTruthy()
    })
  })

  describe('nature field', () => {
    it('shows Débito for Outcoming type', () => {
      renderForm()
      expect(screen.getByDisplayValue('Débito')).toBeTruthy()
    })

    it('shows Crédito when type changes to Incoming', () => {
      renderForm()
      const typeSelect = screen.getByDisplayValue('Egreso')
      fireEvent.change(typeSelect, { target: { value: 'Incoming' } })
      expect(screen.getByDisplayValue('Crédito')).toBeTruthy()
    })

    it('nature field is read-only', () => {
      renderForm()
      const natureInput = screen.getByDisplayValue('Débito')
      expect(natureInput.readOnly).toBe(true)
    })
  })

  describe('save validation', () => {
    it('calls onSave when name is filled', () => {
      renderForm()
      fireEvent.change(screen.getByPlaceholderText('Nombre de la cuenta'), {
        target: { value: 'Servicios EPM' },
      })
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Servicios EPM' }))
    })

    it('does not call onSave when name is empty', () => {
      renderForm()
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('does not call onSave when name is only whitespace', () => {
      renderForm()
      fireEvent.change(screen.getByPlaceholderText('Nombre de la cuenta'), {
        target: { value: '   ' },
      })
      fireEvent.click(screen.getByText('Guardar'))
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('Guardar button is disabled when name is empty', () => {
      renderForm()
      const saveBtn = screen.getByText('Guardar')
      expect(saveBtn.disabled).toBe(true)
    })

    it('Guardar button is enabled when name is provided', () => {
      renderForm()
      fireEvent.change(screen.getByPlaceholderText('Nombre de la cuenta'), {
        target: { value: 'Nombre válido' },
      })
      const saveBtn = screen.getByText('Guardar')
      expect(saveBtn.disabled).toBe(false)
    })
  })

  describe('important checkbox', () => {
    it('renders the important checkbox', () => {
      renderForm()
      expect(screen.getByText('Importante')).toBeTruthy()
    })

    it('toggles important state on click', () => {
      renderForm()
      fireEvent.change(screen.getByPlaceholderText('Nombre de la cuenta'), {
        target: { value: 'Test' },
      })
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.checked).toBe(false)
      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('cancel', () => {
    it('calls onCancel when Cancelar is clicked', () => {
      renderForm()
      fireEvent.click(screen.getByText('Cancelar'))
      expect(mockOnCancel).toHaveBeenCalledOnce()
    })
  })

  describe('saving state', () => {
    it('disables buttons when saving=true', () => {
      renderForm({ saving: true })
      screen.getAllByRole('button').forEach((b) => expect(b.disabled).toBe(true))
    })

    it('shows spinner when saving=true', () => {
      renderForm({ saving: true })
      expect(screen.getByTestId('spinner-sm')).toBeTruthy()
    })
  })
})
