import React, { Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import { useDispatch } from 'react-redux'
import { clearProfile } from '../../actions/authActions'
import { onAuthChange } from '../../services/firebase/auth'
import mytoolsRoutes from '../../routes.mytools'

const MyToolsContent = () => {
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
    return (
      <CContainer
        className="px-2"
        fluid
        style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}
      >
        <CSpinner color="primary" />
      </CContainer>
    )
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
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {mytoolsRoutes.map((route, idx) => {
            const Component = route.element
            return (
              Component && (
                <Route
                  key={idx}
                  path={route.path.replace('/mytools', '')}
                  element={<Component />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="/mytools/home" replace />} />
          <Route path="/*" element={<Navigate to="/mytools/home" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(MyToolsContent)
