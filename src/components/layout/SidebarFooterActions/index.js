import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CNavLink, CSidebarFooter, CSidebarToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAccountLogout, cilMenu, cilApplications } from '@coreui/icons'
import { signOut } from '../../../services/firebase/auth'
import { setUi } from 'src/reducers/uiReducer'

const SidebarFooterActions = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <CSidebarFooter className="border-top d-flex" style={{ flexDirection: 'column', gap: 0 }}>
      <CNavLink as={NavLink} to="/selectApp" className="sidebar-footer-btn">
        <CIcon icon={cilApplications} size="sm" />
        <span>{t('nav.selectApp')}</span>
      </CNavLink>
      <button onClick={handleLogout} className="sidebar-footer-btn">
        <CIcon icon={cilAccountLogout} size="sm" />
        <span>{t('auth.logout')}</span>
      </button>
      <button
        onClick={() => dispatch(setUi({ sidebarShow: false }))}
        className="sidebar-footer-btn"
        style={{ borderBottom: 'none' }}
      >
        <CIcon icon={cilMenu} size="sm" />
        <span>{t('nav.hideMenu')}</span>
      </button>
      <CSidebarToggler onClick={() => dispatch(setUi({ sidebarUnfoldable: !unfoldable }))} />
    </CSidebarFooter>
  )
}

export default SidebarFooterActions
