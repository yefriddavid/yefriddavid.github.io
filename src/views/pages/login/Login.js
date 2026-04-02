import React, { useState, useEffect } from 'react'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import withRouter from '../../../context/searchParamsContext'
import { fetchProfile } from '../../../actions/authActions'
import { getUserForAuth, hashPassword } from '../../../services/providers/firebase/users'
import { createSession } from '../../../services/providers/firebase/sessions'
import './Login.scss'

// ── Icons ──────────────────────────────────────────────────────────
const IconUser = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconLock = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconCash = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const IconArrow = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const Spinner = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
)

// ── Component ──────────────────────────────────────────────────────
const Login = () => {
  const cookieUsername = getCookie('username') || ''
  const cookiePassword = getCookie('password') || ''
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [form, setForm] = useState({
    username: cookieUsername,
    password: cookiePassword,
    rememberMe: !!cookieUsername,
    loading: false,
    error: null,
    shake: false,
  })

  document.title = 'yefriddavid'

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate(localStorage.getItem('landingPage') || '/cash_flow/dashboard')
    }
  }, [])

  const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value, error: null }))

  const toggleRemember = (e) => {
    const checked = e.target.checked
    setForm((prev) => ({ ...prev, rememberMe: checked }))
    if (checked) {
      setCookie('username', form.username)
      setCookie('password', form.password)
    } else {
      deleteCookie('username')
      deleteCookie('password')
    }
  }

  const handleSubmit = async () => {
    if (form.loading) return
    if (!form.username || !form.password) {
      setForm((prev) => ({ ...prev, error: 'Ingresa usuario y contraseña', shake: true }))
      setTimeout(() => setForm((prev) => ({ ...prev, shake: false })), 500)
      return
    }
    setForm((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const user = await getUserForAuth(form.username.trim())
      if (!user) throw new Error('Credenciales incorrectas')
      if (user.active === false) throw new Error('Usuario inactivo')

      const inputHash = await hashPassword(form.password)
      if (inputHash !== user.passwordHash) throw new Error('Credenciales incorrectas')

      const token = btoa(`${user.username}:${Date.now()}`)
      const landing = user.landingPage || '/cash_flow/dashboard'
      const sessionId = crypto.randomUUID()
      localStorage.setItem('token', token)
      localStorage.setItem('username', user.username)
      localStorage.setItem('landingPage', landing)
      localStorage.setItem('sessionId', sessionId)
      createSession(sessionId, user.username, token).catch(() => {})

      if (form.rememberMe) {
        setCookie('username', form.username)
        setCookie('password', form.password)
      }

      dispatch(fetchProfile(user.username))
      navigate(landing)
    } catch (e) {
      setForm((prev) => ({
        ...prev,
        loading: false,
        error: e.message || 'Error de conexión',
        shake: true,
      }))
      setTimeout(() => setForm((prev) => ({ ...prev, shake: false })), 500)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="login-page">
      <div className="login-page__bg" />
      <div className="login-page__grid" />
      <div className="login-page__scanline" />
      <div className="login-page__orb login-page__orb--1" />
      <div className="login-page__orb login-page__orb--2" />

      <div className="login-page__content">
        {/* Brand */}
        <div className="login-page__brand">
          <div className="login-page__logo">
            <IconCash />
          </div>
          <h1 className="login-page__title">
            Cash<span>Flow</span>
          </h1>
          <p className="login-page__subtitle">
            Management Dashboard
            <span className="login-page__cursor" />
          </p>
        </div>

        {/* Card */}
        <div className={`login-page__card${form.shake ? ' login-page__card--error' : ''}`}>
          <div className="login-page__field">
            <label className="login-page__label">Usuario</label>
            <div className="login-page__input-wrap">
              <span className="login-page__icon">
                <IconUser />
              </span>
              <input
                className="login-page__input"
                type="text"
                placeholder="username"
                autoComplete="username"
                value={form.username}
                onChange={set('username')}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="login-page__field">
            <label className="login-page__label">Contraseña</label>
            <div className="login-page__input-wrap">
              <span className="login-page__icon">
                <IconLock />
              </span>
              <input
                className="login-page__input"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={set('password')}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {form.error && (
            <div
              style={{
                fontSize: 12,
                color: '#ff6b6b',
                background: 'rgba(255,107,107,0.08)',
                border: '1px solid rgba(255,107,107,0.2)',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 16,
              }}
            >
              {form.error}
            </div>
          )}

          <label className="login-page__remember">
            <input
              className="login-page__remember-check"
              type="checkbox"
              checked={form.rememberMe}
              onChange={toggleRemember}
            />
            <span className="login-page__remember-label">Recordar sesión</span>
          </label>

          <button className="login-page__btn" onClick={handleSubmit} disabled={form.loading}>
            {form.loading ? <Spinner /> : <IconArrow />}
            {form.loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <div className="login-page__footer">
          Powered by <Link to="https://yefriddavid.github.io">@yefriddavid</Link>
        </div>
      </div>
    </div>
  )
}

export default withRouter(Login)
