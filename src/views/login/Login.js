import React, { useState } from 'react'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import { Link, useNavigate } from 'react-router-dom'
import BrandName from '../../components/BrandName'
import { useDispatch } from 'react-redux'
import withRouter from '../../context/searchParamsContext'
import { fetchProfile } from '../../actions/authActions'
import { signIn } from '../../services/firebase/auth'
import { useForm } from 'react-hook-form'
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
  <svg width="52" height="28" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text
      x="26" y="21"
      textAnchor="middle"
      fontSize="20"
      fontWeight="900"
      fontFamily="Arial Black, Arial, sans-serif"
      fill="#000"
      letterSpacing="2"
    >ADM</text>
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

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#ff6b6b', display: 'block', marginTop: 4 }}>
      {err.message}
    </span>
  ) : null

// ── Component ──────────────────────────────────────────────────────
const Login = () => {
  const cookieUsername = getCookie('username') || ''
  const cookiePassword = getCookie('password') || ''
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shake, setShake] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: cookieUsername,
      password: cookiePassword,
      rememberMe: !!cookieUsername,
    },
  })

  document.title = 'yefriddavid'

  const onSubmit = async ({ username, password, rememberMe }) => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const { username: uname, landingPage, sessionId, token } = await signIn(
        username.trim(),
        password,
      )
      localStorage.setItem('token', token)
      localStorage.setItem('username', uname)
      localStorage.setItem('landingPage', landingPage)
      localStorage.setItem('sessionId', sessionId)
      if (rememberMe) {
        setCookie('username', username)
        setCookie('password', password)
      } else {
        deleteCookie('username')
        deleteCookie('password')
      }
      dispatch(fetchProfile(uname))
      navigate('/selectApp')
    } catch (e) {
      setLoading(false)
      setError(e.message || 'Error de conexión')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(onSubmit)()
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
            <BrandName />
          </h1>
          <p className="login-page__subtitle">
            Management Dashboard
            <span className="login-page__cursor" />
          </p>
        </div>

        {/* Card */}
        <div className={`login-page__card${shake ? ' login-page__card--error' : ''}`}>
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
                onKeyDown={handleKeyDown}
                {...register('username', { required: 'Ingresa tu usuario' })}
              />
            </div>
            {fieldError(errors.username)}
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
                onKeyDown={handleKeyDown}
                {...register('password', { required: 'Ingresa tu contraseña' })}
              />
            </div>
            {fieldError(errors.password)}
          </div>

          {error && (
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
              {error}
            </div>
          )}

          <label className="login-page__remember">
            <input
              className="login-page__remember-check"
              type="checkbox"
              {...register('rememberMe', {
                onChange: (e) => {
                  if (e.target.checked) {
                    const { username, password } = getValues()
                    setCookie('username', username)
                    setCookie('password', password)
                  } else {
                    deleteCookie('username')
                    deleteCookie('password')
                  }
                },
              })}
            />
            <span className="login-page__remember-label">Recordar sesión</span>
          </label>

          <button
            className="login-page__btn"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? <Spinner /> : <IconArrow />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <div className="login-page__footer">
          <Link to="/register" className="login-page__register-link">
            Crear cuenta
          </Link>
          <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
          Powered by <Link to="https://yefriddavid.github.io">@yefriddavid</Link>
        </div>
      </div>
    </div>
  )
}

export default withRouter(Login)
