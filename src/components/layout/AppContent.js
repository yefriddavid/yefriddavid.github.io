import React, { Suspense, useEffect, useState } from 'react'
import ErrorBoundary from '../shared/ErrorBoundary'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import Spinner from '../shared/Spinner'
import { useSelector, useDispatch } from 'react-redux'
import { clearProfile } from '../../actions/authActions'
import { onAuthChange } from '../../services/firebase/auth'
import { authStorage } from 'src/utils/storage'
import { validateSession } from '../../services/firebase/security/sessions'
import routes from '../../routes'
import useNotifications from '../../hooks/useNotifications'

const AppContent = () => {
  // undefined = Firebase still resolving, null = signed out, object = signed in
  const [firebaseUser, setFirebaseUser] = useState(undefined)
  const role = useSelector((s) => s.profile.data?.role ?? null)
  const landingPage =
    useSelector((s) => s.profile.data?.landingPage) ||
    authStorage.getLandingPage() ||
    '/finance/dashboard'
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // ── Subscribe to Firebase Auth state changes ─────────────────────────────────
  // Firebase automatically uses the stored refresh token to restore the session
  // on page reload — no manual token management needed.
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user)
      if (!user) {
        dispatch(clearProfile())
        authStorage.clearSession()
      }
    })
    return unsubscribe
  }, [dispatch])

  // ── Validate Firestore session on auth resolve (prevents stolen sessions) ────
  useEffect(() => {
    if (!firebaseUser) return
    const sessionId = authStorage.getSessionId()
    if (!sessionId) return
    validateSession(sessionId)
      .then((valid) => {
        if (!valid) {
          dispatch(clearProfile())
          navigate('/login')
        }
      })
      .catch(() => {})
  }, [firebaseUser])

  useNotifications()

  // ── Waiting for Firebase to resolve auth state ───────────────────────────────
  if (firebaseUser === undefined) {
    return (
      <Spinner mode="page" />
    )
  }

  // ── Not signed in ────────────────────────────────────────────────────────────
  if (!firebaseUser) {
    return (
      <CContainer className="px-2" fluid>
        <Routes>
          <Route path="/" element={<Navigate to="/aboutMe" replace />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      </CContainer>
    )
  }

  // ── Signed in ────────────────────────────────────────────────────────────────
  const canAccess = (route) => {
    if (!route.roles) return true
    if (!role) return true
    return route.roles.includes(role)
  }

  return (
    <CContainer className="px-2" fluid>
      <ErrorBoundary module="vista">
        <Suspense fallback={<Spinner mode="section" />}>
          <Routes>
            {routes.map((route, idx) => {
              const Component = route.element
              return (
                Component &&
                canAccess(route) && <Route key={idx} path={route.path} element={<Component />} />
              )
            })}
            <Route path="/" element={<Navigate to="/selectApp" replace />} />
            <Route path="/finance" element={<Navigate to={landingPage} replace />} />
            <Route path="/cash_flow" element={<Navigate to={landingPage} replace />} />
            <Route path="/cash_flow/*" element={<Navigate to={landingPage} replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </CContainer>
  )
}

export default React.memo(AppContent)
