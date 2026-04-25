import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'

const MyToolsHome = () => {
  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>My Tools</CCardHeader>
          <CCardBody>
            <p>Bienvenido a My Tools.</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MyToolsHome
