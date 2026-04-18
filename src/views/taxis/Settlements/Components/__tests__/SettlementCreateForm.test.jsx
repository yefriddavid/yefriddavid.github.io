// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettlementCreateForm from '../SettlementCreateForm'
import { makeDriver, makeVehicle } from 'src/__tests__/factories'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

const defaultForm = { driver: '', plate: '', amount: '', date: '2024-04-01', comment: '' }
const defaultProps = {
  form: defaultForm,
  drivers: [],
  vehicles: [],
  loading: false,
  picoPlacaWarning: null,
  error: null,
  onSubmit: vi.fn(),
  onDriverChange: vi.fn(),
  onChange: vi.fn(() => vi.fn()),
}

const renderForm = (props = {}) => render(<SettlementCreateForm {...defaultProps} {...props} />)

describe('SettlementCreateForm', () => {
  describe('rendering', () => {
    it('renders driver, plate, amount, date, comment fields and submit button', () => {
      renderForm()
      expect(screen.getByText('taxis.settlements.fields.driver')).toBeTruthy()
      expect(screen.getByText('taxis.settlements.fields.plate')).toBeTruthy()
      expect(screen.getByText('taxis.settlements.fields.value')).toBeTruthy()
      expect(screen.getByText('taxis.settlements.fields.date')).toBeTruthy()
      expect(screen.getByText('taxis.settlements.fields.comment')).toBeTruthy()
      expect(screen.getByRole('button')).toBeTruthy()
    })

    it('lists drivers as select options', () => {
      const drivers = [
        makeDriver({ id: 'd1', name: 'Juan Perez' }),
        makeDriver({ id: 'd2', name: 'Ana Garcia' }),
      ]
      renderForm({ drivers })
      expect(screen.getByText('Juan Perez')).toBeTruthy()
      expect(screen.getByText('Ana Garcia')).toBeTruthy()
    })

    it('lists vehicles as select options with plate', () => {
      const vehicles = [
        makeVehicle({ id: 'v1', plate: 'ABC123', brand: 'Renault' }),
        makeVehicle({ id: 'v2', plate: 'XYZ999', brand: null }),
      ]
      renderForm({ vehicles })
      expect(screen.getByText('ABC123 · Renault')).toBeTruthy()
      expect(screen.getByText('XYZ999')).toBeTruthy()
    })

    it('shows error message when error prop is set', () => {
      renderForm({ error: 'El conductor es requerido' })
      expect(screen.getByText('El conductor es requerido')).toBeTruthy()
    })

    it('shows pico y placa warning when picoPlacaWarning is set', () => {
      renderForm({ picoPlacaWarning: 'Placa restringida hoy' })
      expect(screen.getByText(/Placa restringida hoy/)).toBeTruthy()
    })

    it('renders save label when not loading', () => {
      renderForm({ loading: false })
      expect(screen.getByText('common.save')).toBeTruthy()
    })
  })

  describe('submit button state', () => {
    it('is enabled when not loading and no pico y placa warning', () => {
      renderForm({ loading: false, picoPlacaWarning: null })
      expect(screen.getByRole('button').disabled).toBe(false)
    })

    it('is disabled when loading', () => {
      renderForm({ loading: true })
      expect(screen.getByRole('button').disabled).toBe(true)
    })

    it('is disabled when picoPlacaWarning is set', () => {
      renderForm({ picoPlacaWarning: 'Placa restringida' })
      expect(screen.getByRole('button').disabled).toBe(true)
    })
  })

  describe('interactions', () => {
    it('calls onDriverChange when driver select changes', () => {
      const onDriverChange = vi.fn()
      const drivers = [makeDriver({ id: 'd1', name: 'Juan Perez' })]
      renderForm({ drivers, onDriverChange })
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'Juan Perez' } })
      expect(onDriverChange).toHaveBeenCalledTimes(1)
    })

    it('calls onChange handler for plate field', () => {
      const fieldHandler = vi.fn()
      const onChange = vi.fn((field) => (field === 'plate' ? fieldHandler : vi.fn()))
      const vehicles = [makeVehicle({ id: 'v1', plate: 'ABC123', brand: null })]
      renderForm({ vehicles, onChange })
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'ABC123' } })
      expect(fieldHandler).toHaveBeenCalledTimes(1)
    })

    it('calls onChange handler for amount field', () => {
      const fieldHandler = vi.fn()
      const onChange = vi.fn((field) => (field === 'amount' ? fieldHandler : vi.fn()))
      renderForm({ onChange })
      const amountInput = screen.getByPlaceholderText('0')
      fireEvent.change(amountInput, { target: { value: '60000' } })
      expect(fieldHandler).toHaveBeenCalledTimes(1)
    })

    it('calls onSubmit when form is submitted', () => {
      const onSubmit = vi.fn((e) => e.preventDefault())
      renderForm({ onSubmit })
      fireEvent.submit(screen.getByRole('button').closest('form'))
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
