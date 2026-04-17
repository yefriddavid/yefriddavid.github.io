/**
 * @jest-environment jsdom
 */
/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NameModal from '../NameModal'

describe('NameModal Component', () => {
  const defaultProps = {
    title: 'Test Modal',
    placeholder: 'Enter name',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders correctly with title and placeholder', () => {
    render(<NameModal {...defaultProps} />)
    expect(screen.getByText('Test Modal')).toBeDefined()
    expect(screen.getByPlaceholderText('Enter name')).toBeDefined()
  })

  it('calls onConfirm when name is entered and button is clicked', () => {
    render(<NameModal {...defaultProps} />)
    const input = screen.getByPlaceholderText('Enter name')
    const button = screen.getByText('Crear')

    fireEvent.change(input, { target: { value: 'New Contract' } })
    fireEvent.click(button)

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('New Contract')
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<NameModal {...defaultProps} />)
    const button = screen.getByText('Cancelar')
    fireEvent.click(button)
    expect(defaultProps.onCancel).toHaveBeenCalled()
  })
})
