import React from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass } from '@coreui/icons'

//import NodeImg from './src/assets/images/learns/nodejs.png'
import NodeImg from 'src/assets/images/learns/nodejs.png'
import DockerImg from 'src/assets/images/learns/docker.png'
import Html5Img from 'src/assets/images/learns/html5.png'
import LinuxImg from 'src/assets/images/learns/linux.png'
import AwsImg from 'src/assets/images/learns/aws.png'
import GolangImg from 'src/assets/images/learns/golang.png'
import ReacJsImg from 'src/assets/images/learns/reactjs.png'

const AboutMe = () => {
  return (
    <>
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">

      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <span className="clearfix">
              <h1 className="float-start display-3 me-4">
                <a style={{color: 'inherit', textDecoration:'none'}} href="/#/login">
                  David Rios
                </a>
              </h1>
              <h4 className="pt-3">Software Develepor!</h4>
              <p className="text-body-secondary float-start">
                I love to travel but, I hate to arrive.
              </p>
            </span>
          </CCol>
        </CRow>
      </CContainer>


    </div>
      <footer>
        <img width="150" high="150" src={NodeImg} />
        <img width="150" high="150" src={DockerImg} />
        <img width="150" high="150" src={Html5Img} />
        <img width="150" high="150" src={LinuxImg} />
        <img width="90" high="150" src={AwsImg} />
        <img width="80" high="150" src={GolangImg} />
        <img width="100" high="150" src={ReacJsImg} />
      </footer>
    </>
  )
}

export default AboutMe
