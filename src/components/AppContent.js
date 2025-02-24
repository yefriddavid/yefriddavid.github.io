import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'

const AppContent = () => {
  const token = localStorage.getItem('token')

  //alert(token)
  let element
  if (token) {
    element = routes.map((route, idx) =>
        route.element && (
          <Route
            key={idx}
            path={route.path}
            exact={route.exact}
            name={route.name}
            element={<route.element />}
          />
        )
    )
  } else {
    element = <Route path="/*" element={<Navigate to={{ pathname: '/login' }} />} />
  }

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {element}
          <Route path="/" element={<Navigate to="abountMe" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
