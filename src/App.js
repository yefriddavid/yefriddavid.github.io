import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { fetchProfile } from './actions/authActions'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import './i18n'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Standalone pages (no app layout)
// const GenerarContrato = React.lazy(() => import('./views/pages/Contratos_REYDAVID/contratos/GenerarContrato'))
const GenerarContrato = React.lazy(
  () => import('./views/pages/Contratos/contratos/GenerarContrato'),
)

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const AboutMe = React.lazy(() => import('./views/pages/aboutMe/Index'))

// temporary line
localStorage.setItem('coreui-free-react-admin-template-theme', 'light')

import * as accountsMasterActions from './actions/CashFlow/accountsMasterActions'

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const appTheme = useSelector((state) => state.ui.appTheme)
  const dispatch = useDispatch()

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  // Background sync for accounting accounts
  useEffect(() => {
    dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch])

  // Restore profile on page refresh when already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    if (token && username) dispatch(fetchProfile(username))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.dataset.appTheme = appTheme
  }, [appTheme])

  return (
    <BrowserRouter>
      {needRefresh && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e3a5f',
            color: '#fff',
            borderRadius: 10,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontSize: 14,
          }}
        >
          <span>Nueva versión disponible</span>
          <button
            onClick={() => updateServiceWorker(true)}
            style={{
              background: '#fff',
              color: '#1e3a5f',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Actualizar
          </button>
        </div>
      )}
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route exact path="/abountMe" name="Abount Me" element={<AboutMe />} />
          <Route
            exact
            path="/contratos/contratos/generar"
            name="Generar Contrato"
            element={<GenerarContrato />}
          />
          <Route path="/*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
