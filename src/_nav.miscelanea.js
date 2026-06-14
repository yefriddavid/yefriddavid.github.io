import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilImage, cil3d, cilListHighPriority, cilCut, cilNotes, cilCode, cilCalculator } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const getMiscelaneaNav = () => [
  {
    component: CNavItem,
    name: 'Tasks',
    to: '/miscelanea/tasks',
    icon: <CIcon icon={cilListHighPriority} customClassName="nav-icon" />,
  },
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
  {
    component: CNavItem,
    name: 'Bastidor',
    to: '/miscelanea/bastidor',
    icon: <CIcon icon={cilCut} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Notas',
    to: '/miscelanea/notes',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Tools Online',
    icon: <CIcon icon={cilCode} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Calc',
        to: '/miscelanea/tools/calc',
        icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
      },
    ],
  },
]

export default getMiscelaneaNav
