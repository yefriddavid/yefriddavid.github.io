import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'

const Users = () => {
  return (
    <CCard>
      <CCardHeader>
        <strong>Usuarios</strong>
      </CCardHeader>
      <CCardBody>
        <p className="text-medium-emphasis">Administración de usuarios del sistema.</p>
      </CCardBody>
    </CCard>
  )
}

export default Users
