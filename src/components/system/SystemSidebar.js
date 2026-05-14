import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
import { SystemIcon } from 'src/components/AppIcons'
import { AppSidebarNav } from '../layout/AppSidebarNav'
import { signOut } from '../../services/firebase/auth'
import { sygnet } from 'src/assets/brand/sygnet'
import getSystemNav from '../../_nav.system'
import { setUi } from 'src/reducers/uiReducer'

const SystemSidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const navigation = getSystemNav()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <CSidebar
      className="border-end sidebar--system"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch(setUi({ sidebarShow: visible }))
      }}
    >
      <CSidebarHeader className="border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span style={{ color: '#a78bfa', flexShrink: 0, display: 'flex' }}><SystemIcon size={20} /></span>
          <h3 className="mb-0" style={{ fontSize: '1.2rem' }}>System</h3>
        </div>
        <CSidebarBrand to="/system/users">
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch(setUi({ sidebarShow: false }))}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter
        className="border-top d-flex"
        style={{ flexDirection: 'column', gap: 0 }}
      >
        <button onClick={() => navigate('/selectApp')} className="sidebar-footer-btn">
          <CIcon icon={cilApplications} size="sm" />
          <span>Seleccionar app</span>
        </button>
        <button onClick={handleLogout} className="sidebar-footer-btn">
          <CIcon icon={cilAccountLogout} size="sm" />
          <span>Cerrar sesión</span>
        </button>
        <button
          onClick={() => dispatch(setUi({ sidebarShow: false }))}
          className="sidebar-footer-btn"
          style={{ borderBottom: 'none' }}
        >
          <CIcon icon={cilMenu} size="sm" />
          <span>Ocultar menú</span>
        </button>
        <CSidebarToggler
          onClick={() => dispatch(setUi({ sidebarUnfoldable: !unfoldable }))}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(SystemSidebar)
