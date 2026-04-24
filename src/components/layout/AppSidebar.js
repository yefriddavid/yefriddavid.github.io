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
import { cilAccountLogout, cilMenu, cilApplications } from '@coreui/icons'

import { AppSidebarNav } from './AppSidebarNav'
import BrandName from '../BrandName'
import { signOut } from '../../services/firebase/auth'
import './AppSidebar.scss'

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
      <CSidebarFooter
        className="border-top d-flex"
        style={{ flexDirection: 'column', gap: 0 }}
      >
        <button onClick={() => navigate('/selectApp')} className="sidebar-footer-btn">
          <CIcon icon={cilApplications} size="sm" />
          <span>{t('nav.selectApp')}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-footer-btn">
          <CIcon icon={cilAccountLogout} size="sm" />
          <span>{t('auth.logout')}</span>
        </button>
        <button
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
          className="sidebar-footer-btn"
          style={{ borderBottom: 'none' }}
        >
          <CIcon icon={cilMenu} size="sm" />
          <span>{t('nav.hideMenu')}</span>
        </button>
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
