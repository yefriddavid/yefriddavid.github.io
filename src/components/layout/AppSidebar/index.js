import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FinanceIcon } from 'src/components/AppIcons'

import { AppSidebarNav } from '../AppSidebarNav'
import BrandName from '../../BrandName'
import SidebarFooterActions from '../SidebarFooterActions'
import './AppSidebar.scss'

import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import getNav from '../../../_nav'
import { setUi } from 'src/reducers/uiReducer'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const role = useSelector((state) => state.profile.data?.role ?? null)
  const navigation = getNav(t, role)

  return (
    <CSidebar
      className="border-end sidebar--finance"
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
          <span style={{ color: '#5b9bd5', flexShrink: 0, display: 'flex' }}><FinanceIcon size={20} /></span>
          <h3 className="mb-0" style={{ fontSize: '1.2rem' }}>
            <BrandName />
          </h3>
        </div>
        <CSidebarBrand to="/">
          {/*<CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />*/}
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

export default React.memo(AppSidebar)
