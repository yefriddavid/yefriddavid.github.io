import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilHome, cilTerminal } from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const getMyToolsNav = () => [
  {
    component: CNavItem,
    name: 'Home',
    to: '/mytools/home',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Serial Console',
    to: '/mytools/serial',
    icon: <CIcon icon={cilTerminal} customClassName="nav-icon" />,
  },
]

export default getMyToolsNav
