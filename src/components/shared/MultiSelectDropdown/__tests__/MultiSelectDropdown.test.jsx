// @vitest-environment jsdom
import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MultiSelectDropdown from '../index'

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

const renderDropdown = (props = {}) =>
  render(
    <MultiSelectDropdown
      label={(size) => (size > 0 ? `Opciones (${size})` : 'Opciones: Todas')}
      options={OPTIONS}
      selected={new Set()}
      onToggle={vi.fn()}
      onClearAll={vi.fn()}
      {...props}
    />,
  )

// Mirrors how real consumers (CryptoPlatforms, AuditFiltersBar) own the Set state.
const StatefulDropdown = ({ initial = new Set(), onSelectedChange }) => {
  const [selected, setSelected] = useState(initial)
  return (
    <MultiSelectDropdown
      label={(size) => (size > 0 ? `Opciones (${size})` : 'Opciones: Todas')}
      options={OPTIONS}
      selected={selected}
      onToggle={(value) =>
        setSelected((prev) => {
          const next = new Set(prev)
          next.has(value) ? next.delete(value) : next.add(value)
          onSelectedChange?.(next)
          return next
        })
      }
      onClearAll={() =>
        setSelected(() => {
          const next = new Set()
          onSelectedChange?.(next)
          return next
        })
      }
    />
  )
}

// The exact predicate every real consumer (CryptoPlatforms, AuditFiltersBar) uses.
const matchesFilter = (selected, value) => selected.size === 0 || selected.has(value)

describe('MultiSelectDropdown', () => {
  it('shows the empty-state label and keeps the dropdown closed', () => {
    renderDropdown()
    expect(screen.getByText('Opciones: Todas ▾')).toBeTruthy()
    expect(screen.queryByText('Alpha')).toBeNull()
  })

  it('opens the dropdown and lists every option plus "Todos"', async () => {
    const user = userEvent.setup()
    renderDropdown()
    await user.click(screen.getByText('Opciones: Todas ▾'))
    expect(screen.getByText('Todos')).toBeTruthy()
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
  })

  it('calls onToggle with the option value when a checkbox is clicked (explicit selection)', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    renderDropdown({ selected: new Set(['a', 'b']), onToggle })
    await user.click(screen.getByText('Opciones (2) ▾'))
    await user.click(screen.getByText('Alpha'))
    expect(onToggle).toHaveBeenCalledWith('a')
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('unchecking one option while "Todos" is active keeps the rest checked (materializes all-but-one)', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    renderDropdown({ selected: new Set(), onToggle })
    await user.click(screen.getByText('Opciones: Todas ▾'))
    await user.click(screen.getByText('Alpha'))
    // Alpha itself must NOT be toggled — only every other option gets selected
    expect(onToggle).not.toHaveBeenCalledWith('a')
    expect(onToggle).toHaveBeenCalledWith('b')
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('unchecking an item from "Todos" leaves it unchecked and the rest checked', async () => {
    const user = userEvent.setup()
    render(<StatefulDropdown />)

    await user.click(screen.getByText('Opciones: Todas ▾'))
    await user.click(screen.getByText('Alpha'))

    const alpha = screen.getByText('Alpha').closest('label').querySelector('input')
    const beta = screen.getByText('Beta').closest('label').querySelector('input')
    expect(alpha.checked).toBe(false)
    expect(beta.checked).toBe(true)
  })

  it('unchecking "Todos" while active unchecks it and every option below', async () => {
    const user = userEvent.setup()
    render(<StatefulDropdown />)

    await user.click(screen.getByText('Opciones: Todas ▾'))
    await user.click(screen.getByText('Todos'))

    const todos = screen.getByText('Todos').closest('label').querySelector('input')
    const alpha = screen.getByText('Alpha').closest('label').querySelector('input')
    const beta = screen.getByText('Beta').closest('label').querySelector('input')
    expect(todos.checked).toBe(false)
    expect(alpha.checked).toBe(false)
    expect(beta.checked).toBe(false)
  })

  it('unchecking "Todos" produces a real Set that matches zero real values (actual filter, not just visual)', async () => {
    let lastSelected = new Set()
    const user = userEvent.setup()
    render(<StatefulDropdown onSelectedChange={(s) => (lastSelected = s)} />)

    await user.click(screen.getByText('Opciones: Todas ▾'))
    await user.click(screen.getByText('Todos'))

    expect(lastSelected.size).toBeGreaterThan(0) // not the "show all" empty Set
    expect(matchesFilter(lastSelected, 'a')).toBe(false)
    expect(matchesFilter(lastSelected, 'b')).toBe(false)
  })

  it('clicking "Todos" again from the "none" state goes back to "all"', async () => {
    const user = userEvent.setup()
    render(<StatefulDropdown />)

    await user.click(screen.getByText('Opciones: Todas ▾'))
    await user.click(screen.getByText('Todos')) // -> none
    await user.click(screen.getByText('Todos')) // -> all again

    const todos = screen.getByText('Todos').closest('label').querySelector('input')
    const alpha = screen.getByText('Alpha').closest('label').querySelector('input')
    const beta = screen.getByText('Beta').closest('label').querySelector('input')
    expect(todos.checked).toBe(true)
    expect(alpha.checked).toBe(true)
    expect(beta.checked).toBe(true)
  })

  it('checking one option after "Todos" was unchecked selects just that one', async () => {
    const user = userEvent.setup()
    render(<StatefulDropdown />)

    await user.click(screen.getByText('Opciones: Todas ▾'))
    await user.click(screen.getByText('Todos')) // -> none
    await user.click(screen.getByText('Alpha'))

    const alpha = screen.getByText('Alpha').closest('label').querySelector('input')
    const beta = screen.getByText('Beta').closest('label').querySelector('input')
    expect(alpha.checked).toBe(true)
    expect(beta.checked).toBe(false)
  })

  it('calls onClearAll when "Todos" is clicked', async () => {
    const onClearAll = vi.fn()
    const user = userEvent.setup()
    renderDropdown({ selected: new Set(['a']), onClearAll })
    await user.click(screen.getByText('Opciones (1) ▾'))
    await user.click(screen.getByText('Todos'))
    expect(onClearAll).toHaveBeenCalled()
  })

  it('checks the "Todos" checkbox only when selection is empty', async () => {
    const user = userEvent.setup()
    renderDropdown({ selected: new Set(['a']) })
    await user.click(screen.getByText('Opciones (1) ▾'))
    const todos = screen.getByText('Todos').closest('label').querySelector('input')
    expect(todos.checked).toBe(false)
  })

  it('marks every option checkbox as checked when "Todos" is active (selection empty)', async () => {
    const user = userEvent.setup()
    renderDropdown({ selected: new Set() })
    await user.click(screen.getByText('Opciones: Todas ▾'))
    const alpha = screen.getByText('Alpha').closest('label').querySelector('input')
    const beta = screen.getByText('Beta').closest('label').querySelector('input')
    expect(alpha.checked).toBe(true)
    expect(beta.checked).toBe(true)
  })

  it('reflects selected options as checked checkboxes', async () => {
    const user = userEvent.setup()
    renderDropdown({ selected: new Set(['b']) })
    await user.click(screen.getByText('Opciones (1) ▾'))
    const alpha = screen.getByText('Alpha').closest('label').querySelector('input')
    const beta = screen.getByText('Beta').closest('label').querySelector('input')
    expect(alpha.checked).toBe(false)
    expect(beta.checked).toBe(true)
  })

  it('closes the dropdown when the accept button is clicked', async () => {
    const user = userEvent.setup()
    renderDropdown()
    await user.click(screen.getByText('Opciones: Todas ▾'))
    expect(screen.getByText('Alpha')).toBeTruthy()
    await user.click(screen.getByText('Aceptar'))
    expect(screen.queryByText('Alpha')).toBeNull()
  })

  it('closes the dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <MultiSelectDropdown
          label="Opciones"
          options={OPTIONS}
          selected={new Set()}
          onToggle={vi.fn()}
          onClearAll={vi.fn()}
        />
        <button>outside</button>
      </div>,
    )
    await user.click(screen.getByText('Opciones ▾'))
    expect(screen.getByText('Alpha')).toBeTruthy()
    await user.click(screen.getByText('outside'))
    expect(screen.queryByText('Alpha')).toBeNull()
  })

  it('supports a static string label', () => {
    renderDropdown({ label: 'Plataforma' })
    expect(screen.getByText('Plataforma ▾')).toBeTruthy()
  })

  it('marks every item as checked when all options are toggled one by one', async () => {
    const user = userEvent.setup()
    render(<StatefulDropdown />)

    await user.click(screen.getByText('Opciones: Todas ▾'))
    await user.click(screen.getByText('Alpha'))
    await user.click(screen.getByText('Beta'))

    const alpha = screen.getByText('Alpha').closest('label').querySelector('input')
    const beta = screen.getByText('Beta').closest('label').querySelector('input')
    expect(alpha.checked).toBe(true)
    expect(beta.checked).toBe(true)
  })
})
