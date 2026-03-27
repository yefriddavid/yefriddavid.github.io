import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import { fetchProfile } from './actions/authActions'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import "./i18n";

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Standalone pages (no app layout)
// const GenerarContrato = React.lazy(() => import('./views/pages/Contratos_REYDAVID/contratos/GenerarContrato'))
const GenerarContrato = React.lazy(() => import('./views/pages/Contratos/contratos/GenerarContrato'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const AboutMe = React.lazy(() => import('./views/pages/aboutMe/Index'))


// temporary line
localStorage.setItem('coreui-free-react-admin-template-theme', 'light')



const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const appTheme = useSelector((state) => state.ui.appTheme)
  const dispatch = useDispatch()

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
