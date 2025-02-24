//import React from 'react'
import React, { useState, useEffect } from 'react'
import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next'
import axios from 'axios'
import { CSpinner } from '@coreui/react'
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
  CFormSwitch,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import withRouter from '../../../context/searchParamsContext'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Login = (props) => {
  const cookieUsername = getCookie('username') || ''
  const cookiePassword = getCookie('password') || ''
  const [LoginFormData, setFormdata] = useState({
    username: cookieUsername,
    password: cookiePassword,
    disabledButton: false,
    rememberMeChecked: cookieUsername == '' ? false : true,
    defaultChecked: cookieUsername == '' ? false : true
  })
  const navigate = useNavigate()
  document.title = `yefriddavid`

  const token = localStorage.getItem('token')
  if (token) {
    setTimeout(() => {
      navigate('/managment/payments')
    }, 1)
  }

  const rememberMe = (event) => {
    const { checked } = event.target

    handleChange({ target: { name: 'rememberMeChecked', value: checked } })

    if (checked === true) {
      const { username, password } = LoginFormData
      console.log(username);
      console.log(password);
      setCookie('username', username)
      setCookie('password', password)
    } else {
      deleteCookie('username')
      deleteCookie('password')
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit()
    } else {
      //const { rememberMeChecked } = LoginFormData
      rememberMe({ target: { checked: LoginFormData.rememberMeChecked } })
    }
  }

  const handleSubmit = async () => {
    handleChange({ target: { name: 'disabledButton', value: true } })
    const { username, password } = LoginFormData
    const bodyFormData = new FormData()
    bodyFormData.append('action', 'login')
    bodyFormData.append('username', username)
    bodyFormData.append('password', password)

    const response = await axios({
      method: 'post',
      url: 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec',
      data: bodyFormData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.status == 'ok' && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token)

      navigate('/managment/payments')
    } else {
      handleChange({ target: { name: 'disabledButton', value: false } })
      alert(response.data.message)
    }
  }

  const handleChange = (event) => {
    setFormdata({ ...LoginFormData, [event.target.name]: event.target.value })
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
                      value={LoginFormData.username}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
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
                        value={LoginFormData.password}
                        onChange={handleChange}
                      onKeyDown={handleKeyDown}
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                      />





                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CFormSwitch
                        onChange={rememberMe}
                        label="Remember me"
                        id="formSwitchCheckChecked"
                        defaultChecked={LoginFormData.defaultChecked}
                      />

                    </CInputGroup>

                    <CRow>
                      <CCol xs={12}>
                        <CButton disabled={LoginFormData.disabledButton} onClick={ handleSubmit } color1="primary" className="px-4" style={{backgroundColor: "black", color: "white", width: "100%"}}>
                          { LoginFormData.disabledButton == true ? <CSpinner as="span" size="sm" aria-hidden="true" /> : <CIcon icon={cilUser} /> }
                           {' '}
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
