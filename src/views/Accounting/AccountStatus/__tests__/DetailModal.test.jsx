// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@coreui/react', () => ({
  CSpinner: () => <span data-testid="spinner" />,
}))

vi.mock('src/constants/cashFlow', () => ({
  ACCOUNT_CATEGORIES: ['Gastos Fijos', 'Servicios', 'Otros'],
  PAYMENT_METHODS: ['Cash', 'Transferencia', 'Débito automático'],
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
    dayNames: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  }),
}))

import DetailModal from '../DetailModal'

const account = {
  id: 'acc1',
  name: 'Internet',
  type: 'Outcoming',
  category: 'Servicios',
  period: 'Mensuales',
  monthStartAt: 'January',
  defaultValue: 80000,
  maxDatePay: 10,
  paymentMethod: 'Débito automático',
  active: true,
  important: false,
  targetAmount: 0,
  classification: 'indispensable',
}

const baseProps = {
  account,
  saving: false,
  onUpdate: vi.fn(),
  onClone: vi.fn(),
  onClose: vi.fn(),
}

const renderModal = (props = {}) => render(<DetailModal {...baseProps} {...props} />)

const switchToEditTab = () => fireEvent.click(screen.getByText('Editar'))

describe('DetailModal', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('Info tab (default)', () => {
    it('renders account name', () => {
      renderModal()
      expect(screen.getByText('Internet')).toBeTruthy()
    })

    it('shows important star when account.important', () => {
      renderModal({ account: { ...account, important: true } })
      expect(screen.getByText('★')).toBeTruthy()
    })

    it('shows Tipo row as Egreso for Outcoming', () => {
      renderModal()
      expect(screen.getByText('Egreso')).toBeTruthy()
    })

    it('shows Tipo row as Ingreso for Incoming', () => {
      renderModal({ account: { ...account, type: 'Incoming' } })
      expect(screen.getByText('Ingreso')).toBeTruthy()
    })

    it('shows category in info rows', () => {
      renderModal()
      expect(screen.getByText('Servicios')).toBeTruthy()
    })

    it('shows period label', () => {
      renderModal()
      expect(screen.getByText(/Mensuales/)).toBeTruthy()
    })

    it('shows Estado as Activa', () => {
      renderModal()
      expect(screen.getByText('Activa')).toBeTruthy()
    })

    it('shows Estado as Inactiva when not active', () => {
      renderModal({ account: { ...account, active: false } })
      expect(screen.getByText('Inactiva')).toBeTruthy()
    })

    it('shows maxDatePay', () => {
      renderModal()
      expect(screen.getByText('Día 10')).toBeTruthy()
    })

    it('calls onClose when Cerrar clicked', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.click(screen.getByText('Cerrar'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      const backdrop = screen.getByText('Cerrar').closest('[style*="fixed"]')
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClone when ⎘ Clonar clicked', () => {
      const onClone = vi.fn()
      renderModal({ onClone })
      fireEvent.click(screen.getByText('⎘ Clonar'))
      expect(onClone).toHaveBeenCalledWith(account)
    })

    it('shows spinner in Clonar when saving', () => {
      renderModal({ saving: true })
      expect(screen.getByTestId('spinner')).toBeTruthy()
    })

    it('Información tab is active by default', () => {
      renderModal()
      expect(screen.getByText('Información')).toBeTruthy()
      expect(screen.getByText('Editar')).toBeTruthy()
    })
  })

  describe('Edit tab', () => {
    it('switches to edit tab when Editar clicked', () => {
      renderModal()
      switchToEditTab()
      expect(screen.getByText('NOMBRE *')).toBeTruthy()
    })

    it('pre-fills name field', () => {
      renderModal()
      switchToEditTab()
      expect(screen.getByDisplayValue('Internet')).toBeTruthy()
    })

    it('save button disabled when name is cleared', () => {
      renderModal()
      switchToEditTab()
      const nameInput = screen.getByDisplayValue('Internet')
      fireEvent.change(nameInput, { target: { value: '' } })
      expect(screen.getByText('Guardar cambios').disabled).toBe(true)
    })

    it('save button enabled with valid name', () => {
      renderModal()
      switchToEditTab()
      expect(screen.getByText('Guardar cambios').disabled).toBe(false)
    })

    it('calls onUpdate with updated form on save', () => {
      const onUpdate = vi.fn()
      renderModal({ onUpdate })
      switchToEditTab()
      const nameInput = screen.getByDisplayValue('Internet')
      fireEvent.change(nameInput, { target: { value: 'Fibra Óptica' } })
      fireEvent.click(screen.getByText('Guardar cambios'))
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Fibra Óptica' }))
    })

    it('calls onClose when Cancelar clicked', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      switchToEditTab()
      fireEvent.click(screen.getByText('Cancelar'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('shows spinner in save button when saving', () => {
      renderModal({ saving: true })
      switchToEditTab()
      expect(screen.getByTestId('spinner')).toBeTruthy()
    })

    it('shows month selector for non-monthly periods', () => {
      renderModal({ account: { ...account, period: 'Trimestrales' } })
      switchToEditTab()
      expect(screen.getByText('MES DE INICIO / APLICA')).toBeTruthy()
    })

    it('does not show month selector for Mensuales', () => {
      renderModal()
      switchToEditTab()
      expect(screen.queryByText('MES DE INICIO / APLICA')).toBeNull()
    })

    it('shows Importante checkbox', () => {
      renderModal()
      switchToEditTab()
      expect(screen.getByRole('checkbox')).toBeTruthy()
    })

    it('Importante checkbox reflects account.important', () => {
      renderModal({ account: { ...account, important: true } })
      switchToEditTab()
      expect(screen.getByRole('checkbox').checked).toBe(true)
    })

    it('shows TIPO, PERÍODO, CLASIFICACIÓN, CATEGORÍA fields', () => {
      renderModal()
      switchToEditTab()
      expect(screen.getByText('TIPO')).toBeTruthy()
      expect(screen.getByText('PERÍODO')).toBeTruthy()
      expect(screen.getByText('CLASIFICACIÓN')).toBeTruthy()
      expect(screen.getByText('CATEGORÍA')).toBeTruthy()
    })

    it('shows DEUDA TOTAL field', () => {
      renderModal()
      switchToEditTab()
      expect(screen.getByText(/DEUDA TOTAL/)).toBeTruthy()
    })
  })
})
