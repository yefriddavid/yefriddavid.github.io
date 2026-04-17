// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@coreui/react', () => ({
  CSpinner: () => <span data-testid="spinner" />,
}))

vi.mock('src/utils/fileHelpers', () => ({
  processAttachmentFile: vi.fn(),
}))

vi.mock('src/utils/moment', () => {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ]
  return { default: { localeData: () => ({ months: () => months }) } }
})

import PayModal from '../PayModal'

const account = {
  id: 'acc1',
  name: 'Arriendo',
  type: 'Outcoming',
  category: 'Gastos Fijos',
  defaultValue: 800000,
  maxDatePay: 5,
  important: false,
}

const baseProps = {
  account,
  year: 2024,
  month: 4,
  saving: false,
  onSave: vi.fn(),
  onClose: vi.fn(),
}

const renderModal = (props = {}) => render(<PayModal {...baseProps} {...props} />)

describe('PayModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders "Registrar pago" title', () => {
    renderModal()
    expect(screen.getByText('Registrar pago')).toBeTruthy()
  })

  it('shows account name', () => {
    renderModal()
    expect(screen.getByText('Arriendo')).toBeTruthy()
  })

  it('shows important star when account.important is true', () => {
    renderModal({ account: { ...account, important: true } })
    expect(screen.getByText(/★/)).toBeTruthy()
  })

  it('pre-fills amount with account.defaultValue', () => {
    renderModal()
    expect(screen.getByDisplayValue('800000')).toBeTruthy()
  })

  it('pre-fills date with computed default (clamped to maxDatePay)', () => {
    renderModal()
    expect(screen.getByDisplayValue('2024-04-05')).toBeTruthy()
  })

  it('save button disabled when amount is empty', () => {
    renderModal({ account: { ...account, defaultValue: 0 } })
    expect(screen.getByText('Guardar pago').disabled).toBe(true)
  })

  it('save button enabled when amount filled', () => {
    renderModal()
    expect(screen.getByText('Guardar pago').disabled).toBe(false)
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

  it('inner sheet stops propagation (clicking sheet does not close)', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.click(screen.getByText('Registrar pago'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onSave with correct payload on submit', () => {
    const onSave = vi.fn()
    renderModal({ onSave })
    fireEvent.click(screen.getByText('Guardar pago'))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        category: 'Gastos Fijos',
        description: 'Arriendo',
        amount: 800000,
        date: '2024-04-05',
        accountMonth: '2024-04',
        accountMasterId: 'acc1',
      }),
    )
  })

  it('payload type is income for Incoming account', () => {
    const onSave = vi.fn()
    renderModal({ account: { ...account, type: 'Incoming' }, onSave })
    fireEvent.click(screen.getByText('Guardar pago'))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ type: 'income' }))
  })

  it('payload includes note when filled', () => {
    const onSave = vi.fn()
    renderModal({ onSave })
    fireEvent.change(screen.getByPlaceholderText('Agregar una nota...'), {
      target: { value: 'nota de pago' },
    })
    fireEvent.click(screen.getByText('Guardar pago'))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ note: 'nota de pago' }))
  })

  it('shows spinner in save button when saving', () => {
    renderModal({ saving: true })
    expect(screen.getByTestId('spinner')).toBeTruthy()
    expect(screen.queryByText('Guardar pago')).toBeNull()
  })

  it('shows MONTO, FECHA, NOTA labels', () => {
    renderModal()
    expect(screen.getByText('MONTO (COP)')).toBeTruthy()
    expect(screen.getByText('FECHA')).toBeTruthy()
    expect(screen.getByText('NOTA (opcional)')).toBeTruthy()
  })

  it('shows ADJUNTO button when no attachment', () => {
    renderModal()
    expect(screen.getByText(/Adjuntar imagen o PDF/)).toBeTruthy()
  })
})
