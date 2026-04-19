import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAccountLogout } from '@coreui/icons'

import { AppSidebarNav } from './AppSidebarNav'
import BrandName from '../BrandName'
import { signOut } from '../../services/firebase/auth'

import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import getNav from '../../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const role = useSelector((state) => state.profile.data?.role ?? null)
  const navigation = getNav(t, role)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <h3>
          <BrandName />
        </h3>
        <CSidebarBrand to="/">
          {/*<CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />*/}
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex" style={{ flexDirection: 'column', gap: 0 }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffc107'; e.currentTarget.style.background = 'rgba(255,193,7,0.07)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'none' }}
        >
          <CIcon icon={cilAccountLogout} size="sm" />
          Cerrar sesión
        </button>
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
