import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { useColorModes } from '@coreui/react'
import Spinner from './components/shared/Spinner'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { fetchProfile } from './actions/authActions'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import './i18n'

// Containers
const EmptyLayout = React.lazy(() => import('./layout/EmptyLayout'))
const FinanceLayout = React.lazy(() => import('./layout/FinanceLayout'))
const MiscelaneaLayout = React.lazy(() => import('./layout/MiscelaneaLayout'))
const DomoticaLayout = React.lazy(() => import('./layout/DomoticaLayout'))
const TaxisLayout = React.lazy(() => import('./layout/TaxisLayout'))
const SystemLayout = React.lazy(() => import('./layout/SystemLayout'))

// Standalone pages (no app layout)
// const GenerarContrato = React.lazy(() => import('./views/Contratos_REYDAVID/contratos/GenerarContrato'))
const GenerarContrato = React.lazy(
  () => import('./views/Contratos/contratos/GenerarContrato/index.js'),
)
const GalleryPage = React.lazy(() => import('./views/Public/GalleryPage'))
const Calc = React.lazy(() => import('./views/Miscelanea/Tools/Calc'))
const SolarCalculatorLocal = React.lazy(() => import('./views/domotica/SolarCalculator/SolarCalculatorLocal'))

// Pages
const Login = React.lazy(() => import('./views/login/Login'))
const LoginSuper = React.lazy(() => import('./views/login/LoginSuper'))
const Register = React.lazy(() => import('./views/register/Register'))
const Page404 = React.lazy(() => import('./views/page404/Page404'))
const Page500 = React.lazy(() => import('./views/page500/Page500'))
const AboutMe = React.lazy(() => import('./views/aboutMe/Index'))
const HardRefresh = React.lazy(() => import('./views/hard-refresh/HardRefresh'))
const SelectApp = React.lazy(() => import('./views/selectApp/SelectApp'))

import * as accountsMasterActions from './actions/cashflow/accountsMasterActions'
import * as taskActions from './actions/taskActions'
import { reportError } from './services/errorReporter'
import { authStorage } from './utils/storage'

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const appTheme = useSelector((state) => state.ui.appTheme)
  const dispatch = useDispatch()

  const { needRefresh: needRefreshState, updateServiceWorker } = useRegisterSW()

  const needRefresh = Array.isArray(needRefreshState) ? needRefreshState[0] : !!needRefreshState

  useEffect(() => {
    const onError = (event) => reportError(event.error ?? new Error(event.message), 'window.onerror')
    const onUnhandled = (event) => reportError(event.reason, 'unhandledrejection')
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  }, [])

  // Background sync for accounting accounts and tasks — only when authenticated
  useEffect(() => {
    const token = authStorage.getToken()
    if (!token) return
    dispatch(accountsMasterActions.fetchRequest())
    dispatch(taskActions.fetchRequest())
  }, [dispatch])

  // Restore profile on page refresh when already authenticated
  useEffect(() => {
    const token = authStorage.getToken()
    const username = authStorage.getUsername()
    if (token && username) dispatch(fetchProfile(username))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const themeParam = urlParams.get('theme')
    const themeMatch = themeParam ? themeParam.match(/^[A-Za-z0-9\s]+/) : null
    const theme = themeMatch ? themeMatch[0] : null

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
      <ErrorBoundary>
        <Suspense
          fallback={<Spinner mode="section" variant="grow" />}
        >
          <Routes>
            <Route element={<EmptyLayout />}>
              <Route path="/login/super" element={<LoginSuper />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/404" element={<Page404 />} />
              <Route path="/500" element={<Page500 />} />
              <Route path="/aboutMe" element={<AboutMe />} />
              <Route path="/hard-refresh" element={<HardRefresh />} />
              <Route path="/selectApp" element={<SelectApp />} />
              <Route path="/contratos/generar" element={<GenerarContrato />} />
              <Route path="/gallery/:folder" element={<GalleryPage />} />
              <Route path="/tools/calc" element={<Calc />} />
              <Route path="/domotica/solar-calculator-local" element={<SolarCalculatorLocal />} />
            </Route>
            <Route path="/finance/*" element={<FinanceLayout />} />
            <Route path="/miscelanea/*" element={<MiscelaneaLayout />} />
            <Route path="/domotica/*" element={<DomoticaLayout />} />
            <Route path="/taxis/*" element={<TaxisLayout />} />
            <Route path="/system/*" element={<SystemLayout />} />
            <Route path="/*" element={<FinanceLayout />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
