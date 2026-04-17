// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('cookies-next', () => ({
  getCookie: vi.fn(() => ''),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

const mockDispatch = vi.fn()
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}))

vi.mock('../../../context/searchParamsContext', () => ({
  default: (Component) => Component,
}))

vi.mock('../../../actions/authActions', () => ({
  fetchProfile: vi.fn((username) => ({ type: 'FETCH_PROFILE', payload: username })),
}))

const mockSignIn = vi.fn()
vi.mock('../../../services/firebase/auth', () => ({
  signIn: (...args) => mockSignIn(...args),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import Login from '../Login'

const renderLogin = () => render(<Login />)

const getUsername = () => screen.getByPlaceholderText('username')
const getPassword = () => screen.getByPlaceholderText('••••••••')
const getSubmitBtn = () => screen.getByRole('button')
const getRememberCheck = () => screen.getByRole('checkbox')

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Login form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    getCookie.mockReturnValue('')
  })

  it('renders username, password fields and submit button', () => {
    renderLogin()
    expect(getUsername()).toBeTruthy()
    expect(getPassword()).toBeTruthy()
    expect(getSubmitBtn()).toBeTruthy()
  })

  it('pre-fills fields from cookies when they exist', () => {
    getCookie.mockImplementation((key) => (key === 'username' ? 'dave' : 'secret'))
    renderLogin()
    expect(getUsername().value).toBe('dave')
    expect(getPassword().value).toBe('secret')
  })

  it('shows error and does not call signIn when fields are empty', async () => {
    renderLogin()
    await act(async () => fireEvent.click(getSubmitBtn()))
    expect(screen.getByText('Ingresa usuario y contraseña')).toBeTruthy()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('clears the error message when the user types after an error', async () => {
    renderLogin()
    await act(async () => fireEvent.click(getSubmitBtn()))
    expect(screen.getByText('Ingresa usuario y contraseña')).toBeTruthy()
    fireEvent.change(getUsername(), { target: { value: 'a' } })
    expect(screen.queryByText('Ingresa usuario y contraseña')).toBeNull()
  })

  it('calls signIn with trimmed username and navigates on success', async () => {
    mockSignIn.mockResolvedValue({
      username: 'dave',
      landingPage: '/dashboard',
      sessionId: 'sid123',
      token: 'tok123',
    })
    renderLogin()
    fireEvent.change(getUsername(), { target: { value: '  dave  ' } })
    fireEvent.change(getPassword(), { target: { value: 'pass' } })

    await act(async () => fireEvent.click(getSubmitBtn()))

    expect(mockSignIn).toHaveBeenCalledWith('dave', 'pass')
    expect(localStorage.getItem('token')).toBe('tok123')
    expect(localStorage.getItem('username')).toBe('dave')
    expect(localStorage.getItem('landingPage')).toBe('/dashboard')
    expect(localStorage.getItem('sessionId')).toBe('sid123')
    expect(mockDispatch).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('shows the error message returned by signIn on failure', async () => {
    mockSignIn.mockRejectedValue(new Error('Credenciales incorrectas'))
    renderLogin()
    fireEvent.change(getUsername(), { target: { value: 'dave' } })
    fireEvent.change(getPassword(), { target: { value: 'wrong' } })

    await act(async () => fireEvent.click(getSubmitBtn()))

    expect(screen.getByText('Credenciales incorrectas')).toBeTruthy()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows generic error when signIn throws without a message', async () => {
    mockSignIn.mockRejectedValue({})
    renderLogin()
    fireEvent.change(getUsername(), { target: { value: 'dave' } })
    fireEvent.change(getPassword(), { target: { value: 'pass' } })

    await act(async () => fireEvent.click(getSubmitBtn()))

    expect(screen.getByText('Error de conexión')).toBeTruthy()
  })

  it('Enter key on any input triggers submit', async () => {
    mockSignIn.mockResolvedValue({
      username: 'dave', landingPage: '/dashboard', sessionId: 's', token: 't',
    })
    renderLogin()
    fireEvent.change(getUsername(), { target: { value: 'dave' } })
    fireEvent.change(getPassword(), { target: { value: 'pass' } })

    await act(async () => fireEvent.keyDown(getPassword(), { key: 'Enter' }))

    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })

  it('disables the button and shows loading text while submitting', async () => {
    let resolveFn
    mockSignIn.mockReturnValue(new Promise((r) => { resolveFn = r }))
    renderLogin()
    fireEvent.change(getUsername(), { target: { value: 'dave' } })
    fireEvent.change(getPassword(), { target: { value: 'pass' } })

    act(() => { fireEvent.click(getSubmitBtn()) })

    await waitFor(() => expect(getSubmitBtn().disabled).toBe(true))
    expect(screen.getByText('Ingresando...')).toBeTruthy()

    // Resolve and restore
    await act(async () => resolveFn({ username: 'dave', landingPage: '/', sessionId: 's', token: 't' }))
  })

  describe('Remember me', () => {
    it('saves cookies when remember-me is checked and login succeeds', async () => {
      mockSignIn.mockResolvedValue({
        username: 'dave', landingPage: '/', sessionId: 's', token: 't',
      })
      renderLogin()
      fireEvent.change(getUsername(), { target: { value: 'dave' } })
      fireEvent.change(getPassword(), { target: { value: 'pass' } })
      fireEvent.click(getRememberCheck()) // check it (default is unchecked when no cookie)

      await act(async () => fireEvent.click(getSubmitBtn()))

      expect(setCookie).toHaveBeenCalledWith('username', 'dave')
      expect(setCookie).toHaveBeenCalledWith('password', 'pass')
    })

    it('deletes cookies when remember-me is unchecked', () => {
      getCookie.mockImplementation((key) => (key === 'username' ? 'dave' : 'secret'))
      renderLogin()
      // checkbox starts checked because cookie exists; uncheck it
      fireEvent.click(getRememberCheck())
      expect(deleteCookie).toHaveBeenCalledWith('username')
      expect(deleteCookie).toHaveBeenCalledWith('password')
    })
  })
})
