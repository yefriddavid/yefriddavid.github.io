// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import NotificationToaster from '../NotificationToaster'
import notificationsReducer, { push } from '../../../reducers/notificationsSlice'

function makeStore(notifications = []) {
  return configureStore({
    reducer: { notifications: notificationsReducer },
    preloadedState: { notifications },
  })
}

function renderToaster(notifications = []) {
  const store = makeStore(notifications)
  const utils = render(
    <Provider store={store}>
      <NotificationToaster />
    </Provider>,
  )
  return { store, ...utils }
}

describe('NotificationToaster', () => {
  let rafCallbacks

  beforeEach(() => {
    rafCallbacks = []
    // useFakeTimers first so stubGlobal wins over it for RAF
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function flushRaf() {
    act(() => {
      const pending = [...rafCallbacks]
      rafCallbacks.length = 0
      pending.forEach((cb) => cb())
    })
  }

  describe('empty state', () => {
    it('renders the container with no close buttons when empty', () => {
      renderToaster()
      expect(screen.queryByRole('button')).toBeNull()
    })
  })

  describe('rendering notifications', () => {
    it('renders the message text', () => {
      renderToaster([{ id: 1, type: 'success', message: 'Gasto creado correctamente.' }])
      expect(screen.getByText('Gasto creado correctamente.')).toBeTruthy()
    })

    it('renders multiple notifications', () => {
      renderToaster([
        { id: 1, type: 'success', message: 'Primero' },
        { id: 2, type: 'error', message: 'Segundo' },
      ])
      expect(screen.getByText('Primero')).toBeTruthy()
      expect(screen.getByText('Segundo')).toBeTruthy()
    })

    it('renders the success icon', () => {
      renderToaster([{ id: 1, type: 'success', message: 'ok' }])
      expect(screen.getByTestId('notification-icon').textContent).toBe('✓')
    })

    it('renders the error icon', () => {
      renderToaster([{ id: 1, type: 'error', message: 'fallo' }])
      expect(screen.getByTestId('notification-icon').textContent).toBe('✕')
    })

    it('renders the warning icon', () => {
      renderToaster([{ id: 1, type: 'warning', message: 'aviso' }])
      expect(screen.getByTestId('notification-icon').textContent).toBe('⚠')
    })

    it('renders the info icon', () => {
      renderToaster([{ id: 1, type: 'info', message: 'info' }])
      expect(screen.getByTestId('notification-icon').textContent).toBe('ℹ')
    })

    it('falls back to info icon for unknown type', () => {
      renderToaster([{ id: 1, type: 'unknown', message: 'raro' }])
      expect(screen.getByTestId('notification-icon').textContent).toBe('ℹ')
    })
  })

  describe('slide-in animation', () => {
    it('starts invisible (opacity 0, translated)', () => {
      renderToaster([{ id: 1, type: 'success', message: 'Hola' }])
      const toast = screen.getByText('Hola').closest('div[style]')
      expect(toast.style.opacity).toBe('0')
      expect(toast.style.transform).toContain('translateX(40px)')
    })

    it('becomes visible after requestAnimationFrame fires', () => {
      renderToaster([{ id: 1, type: 'success', message: 'Hola' }])
      flushRaf()
      const toast = screen.getByText('Hola').closest('div[style]')
      expect(toast.style.opacity).toBe('1')
      expect(toast.style.transform).toContain('translateX(0)')
    })
  })

  describe('close button', () => {
    it('renders one close button per notification', () => {
      renderToaster([{ id: 1, type: 'success', message: 'Cerrable' }])
      expect(screen.getAllByRole('button')).toHaveLength(1)
    })

    it('renders one close button per notification when multiple exist', () => {
      renderToaster([
        { id: 1, type: 'success', message: 'A' },
        { id: 2, type: 'info', message: 'B' },
      ])
      expect(screen.getAllByRole('button')).toHaveLength(2)
    })

    it('removes the notification from the store after close + transition', () => {
      const { store } = renderToaster([{ id: 1, type: 'success', message: 'Cerrar' }])
      expect(store.getState().notifications).toHaveLength(1)

      fireEvent.click(screen.getByRole('button'))
      act(() => { vi.advanceTimersByTime(300) })

      expect(store.getState().notifications).toHaveLength(0)
    })

    it('only removes the clicked notification when multiple exist', () => {
      const { store } = renderToaster([
        { id: 1, type: 'success', message: 'Quitar este' },
        { id: 2, type: 'info', message: 'Mantener' },
      ])

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      act(() => { vi.advanceTimersByTime(300) })

      expect(store.getState().notifications).toHaveLength(1)
      expect(store.getState().notifications[0].id).toBe(2)
    })
  })

  describe('auto-dismiss', () => {
    it('removes success notification after 5000ms + transition', () => {
      const { store } = renderToaster([{ id: 1, type: 'success', message: 'Auto' }])
      expect(store.getState().notifications).toHaveLength(1)

      act(() => { vi.advanceTimersByTime(5000) })
      act(() => { vi.advanceTimersByTime(300) })

      expect(store.getState().notifications).toHaveLength(0)
    })

    it('removes error notification after 8000ms + transition', () => {
      const { store } = renderToaster([{ id: 1, type: 'error', message: 'Error' }])

      act(() => { vi.advanceTimersByTime(7999) })
      expect(store.getState().notifications).toHaveLength(1)

      act(() => { vi.advanceTimersByTime(1) })
      act(() => { vi.advanceTimersByTime(300) })

      expect(store.getState().notifications).toHaveLength(0)
    })

    it('does not dismiss before the delay elapses', () => {
      const { store } = renderToaster([{ id: 1, type: 'success', message: 'Todavía' }])

      act(() => { vi.advanceTimersByTime(4999) })

      expect(store.getState().notifications).toHaveLength(1)
    })

    it('each notification has its own independent timer', () => {
      const { store } = renderToaster([
        { id: 1, type: 'success', message: 'Primero' },
        { id: 2, type: 'error', message: 'Segundo' },
      ])

      // success dismisses at 5000ms, error at 8000ms
      act(() => { vi.advanceTimersByTime(5000) })
      act(() => { vi.advanceTimersByTime(300) })

      expect(store.getState().notifications).toHaveLength(1)
      expect(store.getState().notifications[0].id).toBe(2)
    })
  })

  describe('live dispatch', () => {
    it('shows a notification pushed after initial render', () => {
      const { store } = renderToaster()

      expect(screen.queryByText('Nuevo mensaje')).toBeNull()

      act(() => { store.dispatch(push({ type: 'info', message: 'Nuevo mensaje' })) })

      expect(screen.getByText('Nuevo mensaje')).toBeTruthy()
    })
  })
})
