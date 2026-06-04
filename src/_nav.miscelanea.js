import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilImage, cil3d } from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const getMiscelaneaNav = () => [
  {
    component: CNavItem,
    name: 'Pictures',
    to: '/miscelanea/pictures',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Escenas 3D',
    to: '/miscelanea/scenes3d',
    icon: <CIcon icon={cil3d} customClassName="nav-icon" />,
  },
]

export default getMiscelaneaNav
