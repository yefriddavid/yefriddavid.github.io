import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { AppSidebarNav } from '../layout/AppSidebarNav'
import { signOut } from '../../services/firebase/auth'
import { sygnet } from 'src/assets/brand/sygnet'
import getDomoticaNav from '../../_nav.domotica'

const DomoticaSidebar = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const navigation = getDomoticaNav()

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
        <h3>Domótica</h3>
        <CSidebarBrand to="/domotica/home">
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

export default React.memo(DomoticaSidebar)
