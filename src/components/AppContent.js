import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import { useSelector } from 'react-redux'

// routes config
import routes from '../routes'
import useNotifications from '../hooks/useNotifications'

const AppContent = () => {
  const token = localStorage.getItem('token')
  const role = useSelector((s) => s.profile.data?.role ?? null)
  const landingPage =
    useSelector((s) => s.profile.data?.landingPage) ||
    localStorage.getItem('landingPage') ||
    '/cash_flow/dashboard'

  useNotifications()

  if (!token) {
    return (
      <CContainer className="px-2" fluid>
        <Routes>
          <Route path="/" element={<Navigate to="/abountMe" replace />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      </CContainer>
    )
  }

  // A route is accessible when: no roles restriction OR user has no profile yet (backward compat) OR role matches
  const canAccess = (route) => {
    if (!route.roles) return true
    if (!role) return true // no profile loaded yet — allow (Firestore may still be fetching)
    return route.roles.includes(role)
  }

  return (
    <CContainer className="px-2" fluid>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) =>
            route.element && canAccess(route) ? (
              <Route
                key={idx}
                path={route.path}
                exact={route.exact}
                name={route.name}
                element={<route.element />}
              />
            ) : null,
          )}
          <Route path="/" element={<Navigate to={landingPage} replace />} />
          <Route path="/cash_flow" element={<Navigate to={landingPage} replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
