// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('src/utils/moment', () => {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ]
  return { default: { localeData: () => ({ months: () => months }) } }
})

import AdHocSection from '../AdHocSection'

const expense = {
  id: 'tx1',
  type: 'expense',
  description: 'Mercado',
  amount: 150000,
  date: '2024-04-05',
  note: 'compra semanal',
}

const income = {
  id: 'tx2',
  type: 'income',
  description: 'Freelance',
  amount: 500000,
  date: '2024-04-10',
}

const baseProps = {
  adHocTransactions: [],
  typeTab: 'Outcoming',
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onViewAttachment: vi.fn(),
}

const renderSection = (props = {}) => render(<AdHocSection {...baseProps} {...props} />)

describe('AdHocSection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders "Otras cuentas" title', () => {
    renderSection()
    expect(screen.getByText('Otras cuentas')).toBeTruthy()
  })

  it('renders + Agregar button', () => {
    renderSection()
    expect(screen.getByText('+ Agregar')).toBeTruthy()
  })

  it('calls onAdd when + Agregar clicked', () => {
    const onAdd = vi.fn()
    renderSection({ onAdd })
    fireEvent.click(screen.getByText('+ Agregar'))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('shows count badge when filtered transactions exist', () => {
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming' })
    expect(screen.getByText('1')).toBeTruthy()
  })

  it('no badge when no matching transactions', () => {
    renderSection({ adHocTransactions: [income], typeTab: 'Outcoming' })
    expect(screen.queryByText('1')).toBeNull()
  })

  it('renders expense transaction when typeTab is Outcoming', () => {
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming' })
    expect(screen.getByText('Mercado')).toBeTruthy()
  })

  it('does not render income transaction when typeTab is Outcoming', () => {
    renderSection({ adHocTransactions: [income], typeTab: 'Outcoming' })
    expect(screen.queryByText('Freelance')).toBeNull()
  })

  it('renders income transaction when typeTab is Incoming', () => {
    renderSection({ adHocTransactions: [income], typeTab: 'Incoming' })
    expect(screen.getByText('Freelance')).toBeTruthy()
  })

  it('does not render expense transaction when typeTab is Incoming', () => {
    renderSection({ adHocTransactions: [expense], typeTab: 'Incoming' })
    expect(screen.queryByText('Mercado')).toBeNull()
  })

  it('shows − prefix for expense transactions', () => {
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming' })
    const minuses = screen.getAllByText('−')
    expect(minuses.length).toBeGreaterThan(0)
  })

  it('shows + prefix for income transactions', () => {
    renderSection({ adHocTransactions: [income], typeTab: 'Incoming' })
    const pluses = screen.getAllByText('+')
    expect(pluses.length).toBeGreaterThan(0)
  })

  it('shows transaction date', () => {
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming' })
    expect(screen.getByText('2024-04-05')).toBeTruthy()
  })

  it('shows transaction note', () => {
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming' })
    expect(screen.getByText('compra semanal')).toBeTruthy()
  })

  it('shows transaction amount', () => {
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming' })
    expect(screen.getByText(/150/)).toBeTruthy()
  })

  it('calls onEdit when ✎ clicked', () => {
    const onEdit = vi.fn()
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming', onEdit })
    fireEvent.click(screen.getByTitle('Editar'))
    expect(onEdit).toHaveBeenCalledWith(expense)
  })

  it('calls onDelete when ✕ clicked', () => {
    const onDelete = vi.fn()
    renderSection({ adHocTransactions: [expense], typeTab: 'Outcoming', onDelete })
    fireEvent.click(screen.getByTitle('Eliminar'))
    expect(onDelete).toHaveBeenCalledWith(expense)
  })

  it('shows attachment button when transaction has attachment', () => {
    const withAttach = { ...expense, attachment: 'data:img', attachmentName: 'rec.png' }
    renderSection({ adHocTransactions: [withAttach], typeTab: 'Outcoming' })
    expect(screen.getByTitle('Ver adjunto')).toBeTruthy()
  })

  it('calls onViewAttachment when attachment button clicked', () => {
    const onViewAttachment = vi.fn()
    const withAttach = { ...expense, attachment: 'data:img', attachmentName: 'rec.png' }
    renderSection({
      adHocTransactions: [withAttach],
      typeTab: 'Outcoming',
      onViewAttachment,
    })
    fireEvent.click(screen.getByTitle('Ver adjunto'))
    expect(onViewAttachment).toHaveBeenCalledWith('data:img', 'rec.png')
  })

  it('renders multiple transactions', () => {
    const exp2 = { id: 'tx3', type: 'expense', description: 'Taxi', amount: 20000, date: '2024-04-06' }
    renderSection({ adHocTransactions: [expense, exp2], typeTab: 'Outcoming' })
    expect(screen.getByText('Mercado')).toBeTruthy()
    expect(screen.getByText('Taxi')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })
})
