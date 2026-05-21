import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import Spinner from '../shared/Spinner'
import { useDispatch } from 'react-redux'
import { clearProfile } from '../../actions/authActions'
import { onAuthChange } from '../../services/firebase/auth'
import { authStorage } from 'src/utils/storage'
import domoticaRoutes from '../../routes.domotica'
import ErrorBoundary from '../shared/ErrorBoundary'

const DomoticaContent = () => {
  const [firebaseUser, setFirebaseUser] = useState(undefined)
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
      <ErrorBoundary module="Domotica">
        <Suspense fallback={<Spinner mode="section" />}>
          <Routes>
            {domoticaRoutes.map((route, idx) => {
              const Component = route.element
              return (
                Component && (
                  <Route
                    key={idx}
                    path={route.path.replace('/domotica', '')}
                    element={<Component />}
                  />
                )
              )
            })}
            <Route path="/" element={<Navigate to="/domotica/home" replace />} />
            <Route path="/*" element={<Navigate to="/domotica/home" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </CContainer>
  )
}

export default React.memo(DomoticaContent)
