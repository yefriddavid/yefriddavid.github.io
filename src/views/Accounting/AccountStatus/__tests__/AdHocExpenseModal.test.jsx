// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

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

    it('calls onSave with correct payload on submit', async () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: '  Mercado semanal  ' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), {
        target: { value: '150000' },
      })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          description: 'Mercado semanal',
          amount: 150000,
          accountMonth: '2024-04',
        }),
      )
    })

    it('payload includes type:income when Ingreso selected', async () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.click(screen.getByText('Ingreso'))
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'Sueldo' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), {
        target: { value: '2000000' },
      })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ type: 'income' }))
    })

    it('payload note is null when note field is empty', async () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'X' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1' } })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
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

    it('payload includes id in edit mode', async () => {
      const onSave = vi.fn()
      renderModal({ initialData, onSave })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx1' }))
    })

    it('payload uses initialData.accountMonth', async () => {
      const onSave = vi.fn()
      renderModal({ initialData, onSave })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ accountMonth: '2024-04' }))
    })
  })

  describe('paid state', () => {
    it('defaults to "Pendiente" for a new entry', () => {
      renderModal()
      expect(screen.getByText('Pendiente').style.fontWeight).toBe('700')
    })

    it('submits paid:false by default', async () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'Mercado' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100000' } })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ paid: false }))
    })

    it('clicking Pagada switches state and submits paid:true', async () => {
      const onSave = vi.fn()
      renderModal({ onSave })
      fireEvent.click(screen.getByText('Pagada'))
      expect(screen.getByText('Pagada').style.fontWeight).toBe('700')
      fireEvent.change(screen.getByPlaceholderText('Ej: Reparación, mercado…'), {
        target: { value: 'Mercado' },
      })
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100000' } })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ paid: true }))
    })

    it('respects initialData.paid = false in edit mode', async () => {
      const onSave = vi.fn()
      renderModal({
        onSave,
        initialData: {
          id: 'tx1',
          description: 'Arriendo',
          amount: 900000,
          date: '2024-04-01',
          accountMonth: '2024-04',
          paid: false,
        },
      })
      expect(screen.getByText('Pendiente').style.fontWeight).toBe('700')
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ paid: false }))
    })

    it('defaults to "Pagada" in edit mode when initialData has no paid field (legacy record)', async () => {
      const onSave = vi.fn()
      renderModal({
        onSave,
        initialData: {
          id: 'tx1',
          description: 'Arriendo',
          amount: 900000,
          date: '2024-04-01',
          accountMonth: '2024-04',
        },
      })
      expect(screen.getByText('Pagada').style.fontWeight).toBe('700')
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ paid: true }))
    })
  })

  describe('attachments', () => {
    it('shows "Adjuntar imagen o PDF" when there are no attachments yet', () => {
      renderModal()
      expect(screen.getByText('Adjuntar imagen o PDF')).toBeTruthy()
    })

    it('normalizes a legacy single attachment into the list', () => {
      renderModal({
        initialData: {
          id: 'tx1',
          description: 'Arriendo',
          amount: 900000,
          date: '2024-04-01',
          accountMonth: '2024-04',
          attachment: 'data:img1',
          attachmentName: 'recibo.png',
        },
      })
      expect(screen.getByText('recibo.png')).toBeTruthy()
      expect(screen.getByText('Adjuntar otro')).toBeTruthy()
    })

    it('renders every item from an existing attachments array', () => {
      renderModal({
        initialData: {
          id: 'tx1',
          description: 'Arriendo',
          amount: 900000,
          date: '2024-04-01',
          accountMonth: '2024-04',
          attachments: [
            { data: 'data:img1', name: 'a.png' },
            { data: 'data:img2', name: 'b.png' },
          ],
        },
      })
      expect(screen.getByText('a.png')).toBeTruthy()
      expect(screen.getByText('b.png')).toBeTruthy()
    })

    it('removing an attachment drops it from the payload and reverts the button label', async () => {
      const onSave = vi.fn()
      renderModal({
        onSave,
        initialData: {
          id: 'tx1',
          description: 'Arriendo',
          amount: 900000,
          date: '2024-04-01',
          accountMonth: '2024-04',
          attachments: [{ data: 'data:img1', name: 'a.png' }],
        },
      })
      fireEvent.click(screen.getByTitle('Quitar adjunto'))
      expect(screen.queryByText('a.png')).toBeNull()
      expect(screen.getByText('Adjuntar imagen o PDF')).toBeTruthy()
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ attachment: null, attachmentName: null, attachments: null }),
      )
    })

    it('payload keeps legacy attachment/attachmentName in sync with the first item', async () => {
      const onSave = vi.fn()
      renderModal({
        onSave,
        initialData: {
          id: 'tx1',
          description: 'Arriendo',
          amount: 900000,
          date: '2024-04-01',
          accountMonth: '2024-04',
          attachments: [
            { data: 'data:img1', name: 'a.png' },
            { data: 'data:img2', name: 'b.png' },
          ],
        },
      })
      await act(async () => fireEvent.click(screen.getByText('Guardar')))
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          attachment: 'data:img1',
          attachmentName: 'a.png',
          attachments: [
            { data: 'data:img1', name: 'a.png' },
            { data: 'data:img2', name: 'b.png' },
          ],
        }),
      )
    })
  })
})
