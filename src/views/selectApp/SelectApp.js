import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { onAuthChange, signOut } from '../../services/firebase/auth'
import { deleteSession } from '../../services/firebase/security/sessions'
import { clearProfile } from '../../actions/authActions'
import { useDispatch } from 'react-redux'
import './SelectApp.scss'

const FinanceIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 10h2M11 8h2M15 11h2" />
  </svg>
)

const TaxiIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <rect x="5" y="13" width="14" height="6" rx="2" />
    <path d="M7 9l2-5h6l2 5" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" />
  </svg>
)

const DomoticaIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
    <circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const ArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const APPS = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'flujo de caja · cuentas · reportes',
    path: '/cash_flow/dashboard',
    accent: '#1e3a5f',
    icon: FinanceIcon,
  },
  {
    id: 'taxi',
    name: 'Taxi',
    description: 'operaciones · conductores · liquidaciones',
    path: '/taxis/home',
    accent: '#b8780a',
    icon: TaxiIcon,
  },
  {
    id: 'domotica',
    name: 'Domótica',
    description: 'dispositivos · automatización · hogar',
    path: '/domotica/home',
    accent: '#2d5a4e',
    icon: DomoticaIcon,
  },
]

const SelectApp = () => {
  const [firebaseUser, setFirebaseUser] = useState(undefined)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user)
      if (!user) navigate('/login', { replace: true })
    })
    return unsubscribe
  }, [navigate])

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('sessionId')
    if (sessionId) deleteSession(sessionId).catch(() => {})
    await signOut()
    dispatch(clearProfile())
    navigate('/login')
  }

  if (firebaseUser === undefined) {
    return (
      <div className="select-app__loader">
        <CSpinner color="light" />
      </div>
    )
  }

  return (
    <div className="select-app">
      <aside className="select-app__brand">
        <div className="select-app__logo-mark">
          <div className="select-app__logo-text">
            <h1 className="select-app__name">
              Manage<span>ment</span>
            </h1>
            <p className="select-app__tagline">Management Suite</p>
          </div>
        </div>
        <span className="select-app__version">v3.0 · 2025</span>
      </aside>

      <main className="select-app__apps">
        <p className="select-app__heading">Seleccionar aplicación</p>
        <ul className="select-app__list" role="list">
          {APPS.map(({ id, name, description, path, accent, icon: Icon }) => (
            <li key={id}>
              <button
                className="select-app__card"
                style={{ '--app-accent': accent }}
                onClick={() => navigate(path)}
                aria-label={`Abrir ${name}`}
              >
                <div className="select-app__card-icon">
                  <Icon />
                </div>
                <div className="select-app__card-body">
                  <p className="select-app__card-name">{name}</p>
                  <p className="select-app__card-desc">{description}</p>
                </div>
                <span className="select-app__card-arrow">
                  <ArrowRight />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <footer className="select-app__footer">
          <button className="select-app__logout-btn" onClick={handleLogout}>
            salir
          </button>
        </footer>
      </main>
    </div>
  )
}

export default SelectApp
