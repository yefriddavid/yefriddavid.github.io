import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import Spinner from '../shared/Spinner'
import { useDispatch, useSelector } from 'react-redux'
import { clearProfile } from '../../actions/authActions'
import { onAuthChange } from '../../services/firebase/auth'
import { authStorage } from 'src/utils/storage'
import miscelaneaRoutes from '../../routes.miscelanea'
import ErrorBoundary from '../shared/ErrorBoundary'

const MiscelaneaContent = () => {
  const [firebaseUser, setFirebaseUser] = useState(undefined)
  const role = useSelector((s) => s.profile.data?.role ?? null)
  const dispatch = useDispatch()

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

  if (firebaseUser === undefined) return <Spinner mode="page" />

  if (!firebaseUser) {
    return (
      <CContainer className="px-2" fluid>
        <Routes>
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      </CContainer>
    )
  }

  const canAccess = (route) => {
    if (!route.roles) return true
    if (!role) return true
    return route.roles.includes(role)
  }

  return (
    <CContainer className="px-2" fluid>
      <ErrorBoundary module="Miscelanea">
        <Suspense fallback={<Spinner mode="section" />}>
          <Routes>
            {miscelaneaRoutes.map((route, idx) => {
              const Component = route.element
              return (
                Component &&
                canAccess(route) && (
                  <Route key={idx} path={route.path} element={<Component />} />
                )
              )
            })}
            <Route path="/*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </CContainer>
  )
}

export default React.memo(MiscelaneaContent)
