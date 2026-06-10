import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthChange, signOut } from '../../services/firebase/auth'
import { authStorage } from 'src/utils/storage'
import { deleteSession } from '../../services/firebase/security/sessions'
import { clearProfile } from '../../actions/authActions'
import { useDispatch, useSelector } from 'react-redux'
import './SelectApp.scss'
import {
  FinanceIcon,
  TaxiIcon,
  DomoticaIcon,
  SystemIcon,
  MiscelaneaIcon,
  ShortcutsIcon,
} from 'src/components/AppIcons'
import Spinner from 'src/components/shared/Spinner'

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
    id: 'shortcuts',
    name: 'Shortcuts',
    description: 'accesos rápidos · tareas · estado de cuentas',
    path: '/home',
    accent: '#0f766e',
    icon: ShortcutsIcon,
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'flujo de caja · cuentas · reportes',
    path: '/finance/dashboard',
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

const APPS_SUPER_ADMIN = [
  {
    id: 'miscelanea',
    name: 'Miscelánea',
    description: 'cuadros · escenas 3D',
    path: '/miscelanea/pictures',
    accent: '#5b3a8e',
    icon: MiscelaneaIcon,
  },
  {
    id: 'system',
    name: 'System',
    description: 'usuarios · tenants · logs',
    path: '/system/users',
    accent: '#2d3748',
    icon: SystemIcon,
  },
]

const SelectApp = () => {
  const [firebaseUser, setFirebaseUser] = useState(undefined)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const reduxRole = useSelector((s) => s.profile.data?.role ?? null)
  // Cached role avoids the super-admin cards popping in after the profile fetch.
  // UI hint only — real authorization is enforced by Firestore rules.
  const role = reduxRole ?? authStorage.getRole()
  const visibleApps = role === 'superAdmin' ? [...APPS, ...APPS_SUPER_ADMIN] : APPS

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user)
      if (!user) navigate('/login', { replace: true })
    })
    return unsubscribe
  }, [navigate])

  const handleLogout = async () => {
    const sessionId = authStorage.getSessionId()
    if (sessionId) deleteSession(sessionId).catch(() => {})
    await signOut()
    dispatch(clearProfile())
    navigate('/login')
  }

  if (firebaseUser === undefined) {
    return (
      <div className="select-app__loader">
        <Spinner color="light" />
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
          {visibleApps.map(({ id, name, description, path, accent, icon: Icon }) => (
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
