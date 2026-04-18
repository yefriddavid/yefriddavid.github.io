/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AppContent from '../components/layout/AppContent'
import * as reactRedux from 'react-redux'
import { onAuthChange } from '../services/firebase/auth'

// Mocking dependencies
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux')
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

vi.mock('../services/firebase/auth', () => ({
  onAuthChange: vi.fn(),
}))

vi.mock('../services/firebase/security/sessions', () => ({
  validateSession: vi.fn(() => Promise.resolve(true)),
}))

vi.mock('../hooks/useNotifications', () => ({
  default: vi.fn(),
}))

// Mock lazy components to avoid issues
vi.mock('../routes', () => ({
  default: [
    { path: '/public', name: 'Public', element: () => <div>Public Route</div> },
    { path: '/admin', name: 'Admin', element: () => <div>Admin Route</div>, roles: ['superAdmin'] },
  ],
}))

describe('AppContent Routing', () => {
  const mockUseSelector = vi.mocked(reactRedux.useSelector)

  beforeEach(() => {
    vi.clearAllMocks()
    // Default selector values
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        profile: {
          data: {
            role: 'user',
            landingPage: '/public',
          },
        },
      }
      return selector(state)
    })
  })

  it('shows spinner when auth is resolving', () => {
    vi.mocked(onAuthChange).mockImplementation((cb) => {
      // Do nothing, leave state as undefined (initial)
      return vi.fn()
    })

    render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>,
    )

    expect(
      document.querySelector('.spinner-grow') || document.querySelector('.spinner-border'),
    ).toBeTruthy()
  })

  it('renders public routes for authenticated user', async () => {
    vi.mocked(onAuthChange).mockImplementation((cb) => {
      cb({ uid: '123' }) // simulate signed in
      return vi.fn()
    })

    render(
      <MemoryRouter initialEntries={['/public']}>
        <AppContent />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Public Route')).toBeTruthy()
  })

  it('does not render admin route for normal user', async () => {
    vi.mocked(onAuthChange).mockImplementation((cb) => {
      cb({ uid: '123' }) // simulate signed in
      return vi.fn()
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppContent />
      </MemoryRouter>,
    )

    // It should not find "Admin Route"
    const adminRoute = screen.queryByText('Admin Route')
    expect(adminRoute).toBeNull()
  })

  it('renders admin route for superAdmin', async () => {
    vi.mocked(onAuthChange).mockImplementation((cb) => {
      cb({ uid: '123' }) // simulate signed in
      return vi.fn()
    })

    mockUseSelector.mockImplementation((selector) => {
      const state = {
        profile: {
          data: {
            role: 'superAdmin',
            landingPage: '/admin',
          },
        },
      }
      return selector(state)
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppContent />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Admin Route')).toBeTruthy()
  })
})
