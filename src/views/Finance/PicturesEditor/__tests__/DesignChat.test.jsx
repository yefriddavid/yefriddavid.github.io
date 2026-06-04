// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('src/services/anthropic/designChat', () => ({
  sendDesignMessage: vi.fn(),
}))

import { sendDesignMessage } from 'src/services/anthropic/designChat'
import DesignChat from '../DesignChat'

const CANVAS = { width: 20, height: 15, unit: 'cm' }
const NODES = [{ id: 'n1', type: 'rect', x: 0, y: 0, w: 100, h: 50 }]

const renderChat = (overrides = {}) => {
  const props = {
    canvas: CANVAS,
    nodes: NODES,
    onNodesChange: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }
  return { ...render(<DesignChat {...props} />), props }
}

beforeEach(() => {
  vi.clearAllMocks()
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

// ── Welcome state ─────────────────────────────────────────────────────────────

describe('DesignChat — welcome state', () => {
  it('shows welcome message and suggestions when no messages', () => {
    renderChat()
    expect(screen.getByText('Centra todos los elementos')).toBeInTheDocument()
    expect(screen.getByText('¿Cómo ves el diseño?')).toBeInTheDocument()
    expect(screen.getByText('Mejora la composición')).toBeInTheDocument()
    expect(screen.getByText('Agrega un título')).toBeInTheDocument()
  })

  it('renders header title and close button', () => {
    const { props } = renderChat()
    expect(screen.getByText('✦ Asistente de diseño')).toBeInTheDocument()
    fireEvent.click(screen.getByTitle('Cerrar'))
    expect(props.onClose).toHaveBeenCalledOnce()
  })

  it('renders textarea with placeholder', () => {
    renderChat()
    expect(screen.getByPlaceholderText('Pídeme algo…')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    renderChat()
    expect(screen.getByText('↑')).toBeDisabled()
  })
})

// ── Sending messages ──────────────────────────────────────────────────────────

describe('DesignChat — sending messages', () => {
  it('enables send button when input has text', () => {
    renderChat()
    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Hola' } })
    expect(screen.getByText('↑')).not.toBeDisabled()
  })

  it('sends message on send button click and shows user message', async () => {
    sendDesignMessage.mockResolvedValue({ action: 'message', message: 'Respuesta del asistente' })
    renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Hola Claude' } })
    fireEvent.click(screen.getByText('↑'))

    expect(screen.getByText('Hola Claude')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Respuesta del asistente')).toBeInTheDocument())
  })

  it('sends message on Enter key and clears input', async () => {
    sendDesignMessage.mockResolvedValue({ action: 'message', message: 'Ok' })
    renderChat()

    const textarea = screen.getByPlaceholderText('Pídeme algo…')
    fireEvent.change(textarea, { target: { value: 'Mi mensaje' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

    expect(screen.getByText('Mi mensaje')).toBeInTheDocument()
    await waitFor(() => expect(textarea.value).toBe(''))
  })

  it('does NOT send on Shift+Enter', () => {
    renderChat()
    const textarea = screen.getByPlaceholderText('Pídeme algo…')
    fireEvent.change(textarea, { target: { value: 'Texto' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(sendDesignMessage).not.toHaveBeenCalled()
  })

  it('clicking a suggestion sends it directly', async () => {
    sendDesignMessage.mockResolvedValue({ action: 'message', message: 'Centrado.' })
    renderChat()

    fireEvent.click(screen.getByText('Centra todos los elementos'))

    await waitFor(() => expect(screen.getByText('Centrado.')).toBeInTheDocument())
    expect(sendDesignMessage).toHaveBeenCalledOnce()
  })

  it('passes canvas, nodes and message history to sendDesignMessage', async () => {
    sendDesignMessage.mockResolvedValue({ action: 'message', message: 'Ok' })
    renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('↑'))

    await waitFor(() => expect(sendDesignMessage).toHaveBeenCalledOnce())
    const call = sendDesignMessage.mock.calls[0][0]
    expect(call.canvasConfig).toEqual(CANVAS)
    expect(call.nodes).toEqual(NODES)
    expect(call.messages).toContainEqual({ role: 'user', content: 'Test' })
  })

  it('does not send when input is empty', () => {
    renderChat()
    fireEvent.keyDown(screen.getByPlaceholderText('Pídeme algo…'), { key: 'Enter' })
    expect(sendDesignMessage).not.toHaveBeenCalled()
  })
})

// ── API responses ─────────────────────────────────────────────────────────────

describe('DesignChat — API responses', () => {
  it('calls onNodesChange when action is update_nodes', async () => {
    const newNodes = [{ id: 'n2', type: 'circle' }]
    sendDesignMessage.mockResolvedValue({ action: 'update_nodes', nodes: newNodes, message: 'Listo.' })
    const { props } = renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Agrega círculo' } })
    fireEvent.click(screen.getByText('↑'))

    await waitFor(() => expect(props.onNodesChange).toHaveBeenCalledWith(newNodes))
    expect(screen.getByText('Listo.')).toBeInTheDocument()
  })

  it('does NOT call onNodesChange when action is message', async () => {
    sendDesignMessage.mockResolvedValue({ action: 'message', message: 'El diseño se ve bien.' })
    const { props } = renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: '¿Cómo ves el diseño?' } })
    fireEvent.click(screen.getByText('↑'))

    await waitFor(() => expect(screen.getByText('El diseño se ve bien.')).toBeInTheDocument())
    expect(props.onNodesChange).not.toHaveBeenCalled()
  })

  it('does NOT call onNodesChange when nodes is not an array', async () => {
    sendDesignMessage.mockResolvedValue({ action: 'update_nodes', nodes: null, message: 'Hmm.' })
    const { props } = renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('↑'))

    await waitFor(() => expect(screen.queryByText('Hmm.')).toBeInTheDocument())
    expect(props.onNodesChange).not.toHaveBeenCalled()
  })

  it('shows fallback "Listo." when message field is missing', async () => {
    sendDesignMessage.mockResolvedValue({ action: 'message' })
    renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('↑'))

    await waitFor(() => expect(screen.getByText('Listo.')).toBeInTheDocument())
  })

  it('shows error message when sendDesignMessage throws', async () => {
    sendDesignMessage.mockRejectedValue(new Error('Network error'))
    renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Falla' } })
    fireEvent.click(screen.getByText('↑'))

    await waitFor(() => expect(screen.getByText('Error: Network error')).toBeInTheDocument())
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('DesignChat — loading state', () => {
  it('disables send button while loading', async () => {
    let resolve
    sendDesignMessage.mockReturnValue(new Promise((r) => { resolve = r }))
    renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('↑'))

    expect(screen.getByText('↑')).toBeDisabled()
    resolve({ action: 'message', message: 'Ok' })
    await waitFor(() => expect(screen.getByText('Ok')).toBeInTheDocument())
  })

  it('shows loading indicator while awaiting response', async () => {
    let resolve
    sendDesignMessage.mockReturnValue(new Promise((r) => { resolve = r }))
    renderChat()

    fireEvent.change(screen.getByPlaceholderText('Pídeme algo…'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('↑'))

    expect(document.querySelector('.dchat__msg-bubble--loading')).toBeInTheDocument()
    resolve({ action: 'message', message: 'Listo.' })
    await waitFor(() => expect(document.querySelector('.dchat__msg-bubble--loading')).not.toBeInTheDocument())
  })
})
