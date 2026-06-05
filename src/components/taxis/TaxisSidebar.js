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
import { TaxiIcon } from 'src/components/AppIcons'
import { AppSidebarNav } from '../layout/AppSidebarNav'
import SidebarFooterActions from '../layout/SidebarFooterActions'
import { sygnet } from 'src/assets/brand/sygnet'
import getTaxisNav from '../../_nav.taxis'
import { setUi } from 'src/reducers/uiReducer'

const TaxisSidebar = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const navigation = getTaxisNav(t)

  return (
    <CSidebar
      className="border-end sidebar--taxis"
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
          <span style={{ color: '#ffc107', flexShrink: 0, display: 'flex' }}><TaxiIcon size={20} /></span>
          <h3 className="mb-0" style={{ fontSize: '1.2rem' }}>Gestión de Taxis</h3>
        </div>
        <CSidebarBrand to="/taxis/home">
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

export default React.memo(TaxisSidebar)
