// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@coreui/react', () => ({
  CSpinner: () => <span data-testid="spinner" />,
}))

import PeriodNotes from '../PeriodNotes'

const baseProps = {
  period: '2024-04',
  notes: [],
  saving: false,
  fetching: false,
  onAdd: vi.fn(),
  onToggle: vi.fn(),
  onDelete: vi.fn(),
}

const renderNotes = (props = {}) => render(<PeriodNotes {...baseProps} {...props} />)

const openPanel = () => fireEvent.click(screen.getByRole('button', { name: /notas del período/i }))

describe('PeriodNotes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the toggle button', () => {
    renderNotes()
    expect(screen.getByRole('button', { name: /notas del período/i })).toBeTruthy()
  })

  it('panel is closed by default — note content not visible', () => {
    renderNotes({ notes: [{ id: '1', text: 'test note', checked: false }] })
    expect(screen.queryByText('test note')).toBeNull()
  })

  it('shows count badge when notes exist', () => {
    renderNotes({
      notes: [
        { id: '1', text: 'a', checked: false },
        { id: '2', text: 'b', checked: false },
      ],
    })
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('does not show count badge when notes is empty', () => {
    renderNotes({ notes: [] })
    expect(screen.queryByText('0')).toBeNull()
  })

  it('opens panel on header click', () => {
    renderNotes()
    openPanel()
    expect(screen.getByPlaceholderText('Nueva nota…')).toBeTruthy()
  })

  it('shows "Sin notas" when open and empty', () => {
    renderNotes({ notes: [] })
    openPanel()
    expect(screen.getByText('Sin notas para este período')).toBeTruthy()
  })

  it('shows spinner when fetching', () => {
    renderNotes({ fetching: true })
    openPanel()
    expect(screen.getByTestId('spinner')).toBeTruthy()
  })

  it('does not show "Sin notas" while fetching', () => {
    renderNotes({ fetching: true })
    openPanel()
    expect(screen.queryByText('Sin notas para este período')).toBeNull()
  })

  it('renders note text when open', () => {
    renderNotes({ notes: [{ id: '1', text: 'Pagar arriendo', checked: false }] })
    openPanel()
    expect(screen.getByText('Pagar arriendo')).toBeTruthy()
  })

  it('renders multiple notes', () => {
    renderNotes({
      notes: [
        { id: '1', text: 'Nota uno', checked: false },
        { id: '2', text: 'Nota dos', checked: true },
      ],
    })
    openPanel()
    expect(screen.getByText('Nota uno')).toBeTruthy()
    expect(screen.getByText('Nota dos')).toBeTruthy()
  })

  it('checkbox reflects note.checked state', () => {
    renderNotes({
      notes: [
        { id: '1', text: 'Hecha', checked: true },
        { id: '2', text: 'Pendiente', checked: false },
      ],
    })
    openPanel()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0].checked).toBe(true)
    expect(checkboxes[1].checked).toBe(false)
  })

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn()
    const note = { id: '1', text: 'Nota', checked: false }
    renderNotes({ notes: [note], onToggle })
    openPanel()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith(note)
  })

  it('calls onDelete when × button is clicked', () => {
    const onDelete = vi.fn()
    const note = { id: '1', text: 'Borrar', checked: false }
    renderNotes({ notes: [note], onDelete })
    openPanel()
    fireEvent.click(screen.getByTitle('Eliminar nota'))
    expect(onDelete).toHaveBeenCalledWith(note)
  })

  it('+ Agregar button disabled when input is empty', () => {
    renderNotes()
    openPanel()
    const addBtn = screen.getByTestId('add-note-btn')
    expect(addBtn.disabled).toBe(true)
  })

  it('+ Agregar button enabled after typing', () => {
    renderNotes()
    openPanel()
    fireEvent.change(screen.getByPlaceholderText('Nueva nota…'), {
      target: { value: 'nueva nota' },
    })
    expect(screen.getByTestId('add-note-btn').disabled).toBe(false)
  })

  it('calls onAdd with trimmed text when + Agregar clicked', () => {
    const onAdd = vi.fn()
    renderNotes({ onAdd })
    openPanel()
    fireEvent.change(screen.getByPlaceholderText('Nueva nota…'), {
      target: { value: '  mi nota  ' },
    })
    fireEvent.click(screen.getByTestId('add-note-btn'))
    expect(onAdd).toHaveBeenCalledWith('mi nota')
  })

  it('calls onAdd on Enter key', () => {
    const onAdd = vi.fn()
    renderNotes({ onAdd })
    openPanel()
    const input = screen.getByPlaceholderText('Nueva nota…')
    fireEvent.change(input, { target: { value: 'nota enter' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onAdd).toHaveBeenCalledWith('nota enter')
  })

  it('clears input after adding', () => {
    renderNotes()
    openPanel()
    const input = screen.getByPlaceholderText('Nueva nota…')
    fireEvent.change(input, { target: { value: 'algo' } })
    fireEvent.click(screen.getByTestId('add-note-btn'))
    expect(input.value).toBe('')
  })

  it('does not call onAdd when input is whitespace-only', () => {
    const onAdd = vi.fn()
    renderNotes({ onAdd })
    openPanel()
    fireEvent.change(screen.getByPlaceholderText('Nueva nota…'), { target: { value: '   ' } })
    fireEvent.keyDown(screen.getByPlaceholderText('Nueva nota…'), { key: 'Enter' })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows spinner in button when saving', () => {
    renderNotes({ saving: true })
    openPanel()
    fireEvent.change(screen.getByPlaceholderText('Nueva nota…'), {
      target: { value: 'texto' },
    })
    expect(screen.getByTestId('spinner')).toBeTruthy()
  })

  it('shows createdAt date when present', () => {
    renderNotes({
      notes: [{ id: '1', text: 'Con fecha', checked: false, createdAt: '2024-04-01T10:00:00Z' }],
    })
    openPanel()
    expect(screen.getByText(/2024|abr|ene|jan/i)).toBeTruthy()
  })
})
