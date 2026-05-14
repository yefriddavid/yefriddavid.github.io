// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import SettlementCreateForm from '../SettlementCreateForm'
import { makeDriver, makeVehicle } from 'src/__tests__/factories'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

const defaultProps = {
  drivers: [],
  vehicles: [],
  vehiclesMap: new Map(),
  loading: false,
  onSave: vi.fn(),
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

    it('renders save label when not loading', () => {
      renderForm({ loading: false })
      expect(screen.getByText('common.save')).toBeTruthy()
    })

    it('shows pico y placa warning when restricted plate and date are selected', () => {
      const vehicle = makeVehicle({
        id: 'v1',
        plate: 'XYZ999',
        brand: null,
        restrictions: { 4: { d1: 15, d2: 22 } },
      })
      const vehiclesMap = new Map([['XYZ999', vehicle]])
      renderForm({ vehicles: [vehicle], vehiclesMap })
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'XYZ999' } })
      const dateInput = document.querySelector('input[type="date"]')
      fireEvent.change(dateInput, { target: { value: '2024-04-15' } })
      expect(screen.getByText(/taxis.settlements.errors.picoPlaca/)).toBeTruthy()
    })
  })

  describe('submit button state', () => {
    it('is enabled when not loading and no pico y placa warning', () => {
      renderForm({ loading: false })
      expect(screen.getByRole('button').disabled).toBe(false)
    })

    it('is disabled when loading', () => {
      renderForm({ loading: true })
      expect(screen.getByRole('button').disabled).toBe(true)
    })

    it('is disabled when restricted plate and date are selected', () => {
      const vehicle = makeVehicle({
        id: 'v1',
        plate: 'XYZ999',
        brand: null,
        restrictions: { 4: { d1: 15, d2: 22 } },
      })
      const vehiclesMap = new Map([['XYZ999', vehicle]])
      renderForm({ vehicles: [vehicle], vehiclesMap })
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'XYZ999' } })
      const dateInput = document.querySelector('input[type="date"]')
      fireEvent.change(dateInput, { target: { value: '2024-04-15' } })
      expect(screen.getByRole('button').disabled).toBe(true)
    })
  })

  describe('interactions', () => {
    it('auto-fills plate and amount when driver with defaults is selected', () => {
      const driver = makeDriver({
        id: 'd1',
        name: 'Juan Perez',
        defaultVehicle: 'ABC123',
        defaultAmount: 50000,
      })
      const vehicle = makeVehicle({ id: 'v1', plate: 'ABC123', brand: null })
      renderForm({ drivers: [driver], vehicles: [vehicle] })
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'Juan Perez' } })
      expect(selects[1].value).toBe('ABC123')
      expect(screen.getByDisplayValue('50000')).toBeTruthy()
    })

    it('calls onSave when form is submitted with all required fields', async () => {
      const onSave = vi.fn()
      const driver = makeDriver({ id: 'd1', name: 'Juan Perez' })
      const vehicle = makeVehicle({ id: 'v1', plate: 'ABC123', brand: null })
      renderForm({ drivers: [driver], vehicles: [vehicle], onSave })
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'Juan Perez' } })
      fireEvent.change(selects[1], { target: { value: 'ABC123' } })
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '50000' } })
      const dateInput = document.querySelector('input[type="date"]')
      fireEvent.change(dateInput, { target: { value: '2024-04-10' } })
      await act(async () => fireEvent.submit(screen.getByRole('button').closest('form')))
      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })
})
