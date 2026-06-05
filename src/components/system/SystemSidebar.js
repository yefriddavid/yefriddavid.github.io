import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { SystemIcon } from 'src/components/AppIcons'
import { AppSidebarNav } from '../layout/AppSidebarNav'
import SidebarFooterActions from '../layout/SidebarFooterActions'
import { sygnet } from 'src/assets/brand/sygnet'
import getSystemNav from '../../_nav.system'
import { setUi } from 'src/reducers/uiReducer'

const SystemSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const navigation = getSystemNav()

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
      <SidebarFooterActions />
    </CSidebar>
  )
}

export default React.memo(SystemSidebar)
