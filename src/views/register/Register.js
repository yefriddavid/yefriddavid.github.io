import React, { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import Captcha from '../../components/Captcha'
import { registerNewTenant } from '../../services/firebase/register'
import BrandName, { APP_NAME } from '../../components/BrandName'
import '../login/Login.scss'

// ── Icons ──────────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconName = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="12" />
    <path d="M9 12h6M9 16h6" />
  </svg>
)

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const IconCash = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
    </path>
  </svg>
)

// ── Password strength ──────────────────────────────────────────────
const STRENGTH_LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']

function getPasswordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const STRENGTH_COLORS = ['', '#ff4757', '#ffa502', '#2ed573', '#ffc107']

const StrengthMeter = ({ password }) => {
  const strength = getPasswordStrength(password)
  if (!password) return null
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 8 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 99,
            background: strength >= i ? STRENGTH_COLORS[Math.min(strength, 4)] : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }}
        />
      ))}
      <span style={{
        fontSize: 10,
        marginLeft: 6,
        minWidth: 44,
        textAlign: 'right',
        color: strength ? STRENGTH_COLORS[Math.min(strength, 4)] : 'rgba(255,255,255,0.3)',
        transition: 'color 0.3s',
      }}>
        {STRENGTH_LABELS[strength]}
      </span>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────
const Register = () => {
  const captchaRef = useRef(null)
  const [captchaValid, setCaptchaValid] = useState(false)
  const [form, setForm] = useState({
    company: '',
    name: '',
    email: '',
    username: '',
    password: '',
    confirm: '',
    loading: false,
    error: null,
    shake: false,
    success: false,
  })

  document.title = `Crear cuenta — ${APP_NAME}`

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value, error: null }))

  const validate = () => {
    if (!form.company.trim()) return 'Ingresa el nombre de tu empresa u organización'
    if (!form.name.trim()) return 'Ingresa tu nombre completo'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'El email no es válido'
    if (!form.username.trim()) return 'Elige un nombre de usuario'
    if (form.username.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) return 'El usuario solo puede tener letras, números y _'
    if (!form.password) return 'Ingresa una contraseña'
    if (getPasswordStrength(form.password) < 2) return 'La contraseña es demasiado débil'
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden'
    return null
  }

  const handleSubmit = useCallback(async () => {
    if (form.loading) return
    const error = validate()
    if (error) {
      setForm((prev) => ({ ...prev, error, shake: true }))
      setTimeout(() => setForm((prev) => ({ ...prev, shake: false })), 500)
      return
    }
    if (!captchaValid) {
      setForm((prev) => ({ ...prev, error: 'Completa el código de verificación', shake: true }))
      setTimeout(() => setForm((prev) => ({ ...prev, shake: false })), 500)
      return
    }
    setForm((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await registerNewTenant({
        company: form.company.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
      })
      setForm((prev) => ({ ...prev, loading: false, success: true }))
    } catch (err) {
      const msg = err?.code === 'permission-denied'
        ? 'No se pudo completar el registro. Intenta más tarde.'
        : err?.message || 'Error al crear la cuenta. Intenta nuevamente.'
      setForm((prev) => ({ ...prev, loading: false, error: msg, shake: true }))
      setTimeout(() => setForm((prev) => ({ ...prev, shake: false })), 500)
    }
  }, [form, captchaValid])

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

      <div className="login-page__content" style={{ maxWidth: 420 }}>
        {/* Brand */}
        <div className="login-page__brand">
          <div className="login-page__logo">
            <IconCash />
          </div>
          <h1 className="login-page__title">
            <BrandName />
          </h1>
          <p className="login-page__subtitle">
            Crear cuenta nueva
            <span className="login-page__cursor" />
          </p>
        </div>

        {/* Card */}
        <div className={`login-page__card${form.shake ? ' login-page__card--error' : ''}`}>
          {form.success ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 56, height: 56,
                background: 'rgba(255,193,7,0.12)',
                border: '1px solid rgba(255,193,7,0.3)',
                borderRadius: '50%',
                marginBottom: 16,
                color: '#ffc107',
              }}>
                <IconCheck />
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                ¡Cuenta creada!
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', lineHeight: 1.5 }}>
                Tu solicitud fue enviada. Un administrador activará tu cuenta pronto.
              </p>
              <Link to="/login" className="login-page__btn" style={{ textDecoration: 'none' }}>
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="login-page__field">
                <label className="login-page__label">Empresa / Organización</label>
                <div className="login-page__input-wrap">
                  <span className="login-page__icon"><IconBuilding /></span>
                  <input
                    className="login-page__input"
                    type="text"
                    placeholder="Nombre de tu empresa"
                    autoComplete="organization"
                    value={form.company}
                    onChange={set('company')}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              <div className="login-page__field">
                <label className="login-page__label">Nombre completo</label>
                <div className="login-page__input-wrap">
                  <span className="login-page__icon"><IconName /></span>
                  <input
                    className="login-page__input"
                    type="text"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    value={form.name}
                    onChange={set('name')}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              <div className="login-page__field">
                <label className="login-page__label">Email <span style={{ opacity: 0.4, fontWeight: 400 }}>(opcional)</span></label>
                <div className="login-page__input-wrap">
                  <span className="login-page__icon"><IconMail /></span>
                  <input
                    className="login-page__input"
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0 20px' }} />

              <div className="login-page__field">
                <label className="login-page__label">Usuario</label>
                <div className="login-page__input-wrap">
                  <span className="login-page__icon"><IconUser /></span>
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
                  <span className="login-page__icon"><IconLock /></span>
                  <input
                    className="login-page__input"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set('password')}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <StrengthMeter password={form.password} />
              </div>

              <div className="login-page__field">
                <label className="login-page__label">Confirmar contraseña</label>
                <div className="login-page__input-wrap">
                  <span className="login-page__icon"><IconShield /></span>
                  <input
                    className="login-page__input"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    onKeyDown={handleKeyDown}
                    style={form.confirm && form.confirm !== form.password ? {
                      borderColor: 'rgba(255,107,107,0.5)',
                      background: 'rgba(255,107,107,0.06)',
                    } : {}}
                  />
                </div>
              </div>

              <Captcha ref={captchaRef} onValidChange={setCaptchaValid} />

              {form.error && (
                <div style={{
                  fontSize: 12,
                  color: '#ff6b6b',
                  background: 'rgba(255,107,107,0.08)',
                  border: '1px solid rgba(255,107,107,0.2)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 16,
                }}>
                  {form.error}
                </div>
              )}

              <button className="login-page__btn" onClick={handleSubmit} disabled={form.loading}>
                {form.loading ? <Spinner /> : null}
                {form.loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" style={{ color: '#ffc107', textDecoration: 'none', fontWeight: 600 }}>
                  Inicia sesión
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="login-page__footer">
          Powered by <Link to="https://yefriddavid.github.io">@yefriddavid</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
