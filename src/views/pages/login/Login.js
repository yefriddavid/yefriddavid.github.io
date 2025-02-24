//import React from 'react'
import React, { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import withRouter from '../../../context/searchParamsContext'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Login = (props) => {

  const [credentials, setPassword] = useState({username: '', password: ''})
  const navigate = useNavigate()
  document.title = `yefriddavid`

  const token = localStorage.getItem('token')
  if (token) {

    setTimeout( () => {

      navigate('/managment/payments')
    }, 1)

  }

  const authLogin = () => {
    //alert("aca")
    //console.log(props)

    const { username, password } = credentials
    if (username == 'fabian' || username == 'david' || username == 'pao') {
      localStorage.setItem('token', '123-456-789')

      navigate('/managment/payments')

    }
    else {
      alert('Password invalido')
    }
  }

  const handleChange = (event) => {
    setPassword({ ...credentials, [event.target.name]: event.target.value })
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4" style={{ width: '44%', backgroundColor: '#ffc107' }}>
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      {/*}
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      */}
                      <CFormInput
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder="Username" autoComplete="username" />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      {/*
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      */}
                      <CFormInput
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={12}>
                        <CButton onClick={ authLogin } color1="primary" className="px-4" style={{backgroundColor: "black", color: "white", width: "100%"}}>
                          <CIcon icon={cilUser} /> {' '}
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary1 py-5 .d-none .d-sm-block .d-md-none" style={{ width: '44%', backgroundColor: '#000' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Managment Software</h2>
                    <p>
                      Powered by {' '}
                      <Link to="https://yefriddavid.github.io">
                        @yefriddavid
                      </Link>
                    </p>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default withRouter(Login)
