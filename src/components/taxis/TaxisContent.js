import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import Spinner from '../shared/Spinner'
import { useDispatch } from 'react-redux'
import { clearProfile } from '../../actions/authActions'
import { onAuthChange } from '../../services/firebase/auth'
import taxisRoutes from '../../routes.taxis'
import ErrorBoundary from '../shared/ErrorBoundary'

const TaxisContent = () => {
  const [firebaseUser, setFirebaseUser] = useState(undefined)
  const dispatch = useDispatch()

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user)
      if (!user) {
        dispatch(clearProfile())
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('sessionId')
        localStorage.removeItem('landingPage')
      }
    })
    return unsubscribe
  }, [dispatch])

  if (firebaseUser === undefined) {
    return <Spinner mode="page" />
  }

  if (!firebaseUser) {
    return (
      <CContainer className="px-2" fluid>
        <Routes>
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      </CContainer>
    )
  }

  return (
    <CContainer className="px-2" fluid>
      <ErrorBoundary module="Taxis">
        <Suspense fallback={<Spinner mode="section" />}>
          <Routes>
            {taxisRoutes.map((route, idx) => {
              const Component = route.element
              return Component && <Route key={idx} path={route.path.replace('/taxis', '')} element={<Component />} />
            })}
            <Route path="/" element={<Navigate to="/taxis/home" replace />} />
            <Route path="/*" element={<Navigate to="/taxis/home" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </CContainer>
  )
}

export default React.memo(TaxisContent)
