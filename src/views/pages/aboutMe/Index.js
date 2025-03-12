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

//import NodeImg from './src/assets/images/skills/nodejs.png'
import NodeImg from 'src/assets/images/skills/nodejs.png'
import DockerImg from 'src/assets/images/skills/docker.png'
import Html5Img from 'src/assets/images/skills/html5.png'
import LinuxImg from 'src/assets/images/skills/linux.png'
import AwsImg from 'src/assets/images/skills/aws.png'
import GolangImg from 'src/assets/images/skills/golang.png'
import ReacJsImg from 'src/assets/images/skills/reactjs.png'

import MongoDbImg from 'src/assets/images/skills/mongodb.png'
import MysqlImg from 'src/assets/images/skills/mysql.png'
import ReduxImg from 'src/assets/images/skills/redux.png'
import SagaImg from 'src/assets/images/skills/sagas.png'
import RedisImg from 'src/assets/images/skills/redis.png'

const AboutMe = () => {
  return (
    <>
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">

      <CContainer>
        <CRow className="justify-content-center" style1={{fontFamily: "Oswald"}}>
          <CCol md={6}>
            <span className="clearfix">
              <h1 className="float-start display-3 me-4">
                <a style={{color: 'inherit', textDecoration:'none'}} href="/#/login">
                  David Rios
                </a>
              </h1>
              <h4 className="pt-3">Software Develepor!</h4>
              <a className="pt-3" href="https://www.linkedin.com/in/yefriddavid">@linkedin</a>
              <p className="text-body-secondary float-start">
                I love to travel but, I hate to arrive.
              </p>
            </span>
          </CCol>
        </CRow>
      </CContainer>


    </div>
      <footer>
        <img width="90" high="150" src={AwsImg} />
        <img width="150" high="150" src={LinuxImg} />
        <img width="150" high="150" src={DockerImg} />

        <img width="150" high="150" src={NodeImg} />
        <img width="80" high="150" src={GolangImg} />

        <img width="100" high="150" src={MongoDbImg} />
        <img width="100" high="150" src={MysqlImg} />
        <img width="100" high="150" src={RedisImg} />

        <img width="150" high="150" src={Html5Img} />
        <img width="100" high="150" src={ReacJsImg} />
        <img width="100" high="150" src={ReduxImg} />
        <img width="100" high="150" src={SagaImg} />
      </footer>
    </>
  )
}

export default AboutMe
