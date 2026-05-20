import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import Spinner from '../shared/Spinner'
import { useDispatch } from 'react-redux'
import { clearProfile } from '../../actions/authActions'
import { onAuthChange } from '../../services/firebase/auth'
import systemRoutes from '../../routes.system'

const SystemContent = () => {
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
      <Suspense fallback={<Spinner mode="section" />}>
        <Routes>
          {systemRoutes.map((route, idx) => {
            const Component = route.element
            return Component && <Route key={idx} path={route.path.replace('/system', '')} element={<Component />} />
          })}
          <Route path="/" element={<Navigate to="/system/users" replace />} />
          <Route path="/*" element={<Navigate to="/system/users" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(SystemContent)
