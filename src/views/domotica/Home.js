import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'

const DomoticaHome = () => {
  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Domótica</CCardHeader>
          <CCardBody>
            <p>Bienvenido al panel de domótica.</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DomoticaHome
