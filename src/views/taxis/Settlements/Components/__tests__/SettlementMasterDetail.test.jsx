// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettlementMasterDetail from '../SettlementMasterDetail'
import { makeSettlement, makeDriver, makeVehicle } from 'src/__tests__/factories'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('src/components/shared/StandardForm', () => ({
  __esModule: true,
  default: ({ title, onCancel, onSave, saving, children }) => (
    <div data-testid="standard-form">
      <span>{title}</span>
      {children}
      <button onClick={onCancel}>cancel</button>
      <button onClick={onSave} disabled={saving}>
        save
      </button>
    </div>
  ),
  StandardField: ({ label, children }) => (
    <div>
      <label>{label}</label>
      {children}
    </div>
  ),
  SF: { input: '', select: '', textarea: '' },
}))

vi.mock('src/components/shared/DetailPanel', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="detail-panel">{children}</div>,
  DetailSection: ({ title, children }) => (
    <div data-testid={`section-${title}`}>
      <strong>{title}</strong>
      {children}
    </div>
  ),
  DetailRow: ({ label, value }) => (
    <div data-testid={`row-${label}`}>
      <span>{label}</span>
      <span>{value ?? ''}</span>
    </div>
  ),
}))

const settlement = makeSettlement({
  id: 's1',
  driver: 'Juan Perez',
  plate: 'ABC123',
  amount: 50000,
  date: '2024-04-05',
  comment: 'abono',
  paid_at: null,
})
const driver = makeDriver({ name: 'Juan Perez', idNumber: '12345678', phone: '3001234567' })
const vehicle = makeVehicle({ plate: 'ABC123', brand: 'Renault', model: 'Logan', year: 2020 })

const renderDetail = (props = {}) =>
  render(
    <SettlementMasterDetail
      data={settlement}
      drivers={[driver]}
      vehicles={[vehicle]}
      onSave={vi.fn()}
      saving={false}
      editingRowIdRef={{ current: null }}
      {...props}
    />,
  )

describe('SettlementMasterDetail — view mode', () => {
  it('renders settlement fields', () => {
    renderDetail()
    expect(screen.getByTestId('detail-panel')).toBeTruthy()
    expect(screen.getByText('2024-04-05')).toBeTruthy()
    expect(screen.getByText('abono')).toBeTruthy()
  })

  it('renders driver section with driver info when driver is found', () => {
    renderDetail()
    expect(screen.getByText('12345678')).toBeTruthy()
    expect(screen.getByText('3001234567')).toBeTruthy()
  })

  it('renders vehicle section with vehicle info when vehicle is found', () => {
    renderDetail()
    expect(screen.getByText('Renault')).toBeTruthy()
    expect(screen.getByText('Logan')).toBeTruthy()
    expect(screen.getByText('2020')).toBeTruthy()
  })

  it('shows no data message when driver is not found', () => {
    renderDetail({ drivers: [] })
    expect(screen.getByText('taxis.settlements.noDataInfo')).toBeTruthy()
  })

  it('shows no data message when vehicle is not found', () => {
    renderDetail({ vehicles: [] })
    expect(screen.getByText('taxis.settlements.noDataInfo')).toBeTruthy()
  })

  it('shows edit button', () => {
    renderDetail()
    expect(screen.getByText('common.edit')).toBeTruthy()
  })

  it('switches to edit mode when edit button is clicked', () => {
    renderDetail()
    fireEvent.click(screen.getByText('common.edit'))
    expect(screen.getByTestId('standard-form')).toBeTruthy()
  })
})

describe('SettlementMasterDetail — edit mode', () => {
  const renderEditing = (props = {}) => {
    const ref = { current: 's1' }
    return renderDetail({ editingRowIdRef: ref, ...props })
  }

  it('initializes in edit mode when editingRowIdRef matches data.id', () => {
    renderEditing()
    expect(screen.getByTestId('standard-form')).toBeTruthy()
  })

  it('pre-populates form fields with current data', () => {
    renderEditing()
    const dateInput = document.querySelector('input[type="date"]')
    expect(dateInput.value).toBe('2024-04-05')
  })

  it('returns to view mode when cancel is clicked', () => {
    renderEditing()
    fireEvent.click(screen.getByText('cancel'))
    expect(screen.getByTestId('detail-panel')).toBeTruthy()
  })

  it('calls onSave with merged data and amount as Number when save is clicked', () => {
    const onSave = vi.fn()
    renderEditing({ onSave })
    fireEvent.click(screen.getByText('save'))
    expect(onSave).toHaveBeenCalledTimes(1)
    const saved = onSave.mock.calls[0][0]
    expect(saved.id).toBe('s1')
    expect(typeof saved.amount).toBe('number')
    expect(saved.amount).toBe(50000)
  })

  it('returns to view mode after saving', () => {
    renderEditing()
    fireEvent.click(screen.getByText('save'))
    expect(screen.getByTestId('detail-panel')).toBeTruthy()
  })

  it('disables save button when saving prop is true', () => {
    renderEditing({ saving: true })
    const saveBtn = screen.getByText('save')
    expect(saveBtn.disabled).toBe(true)
  })
})
