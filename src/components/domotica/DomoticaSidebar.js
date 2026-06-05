import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import logoDomotica from 'src/assets/images/domotica/logo-domotica.svg'
import { AppSidebarNav } from '../layout/AppSidebarNav'
import SidebarFooterActions from '../layout/SidebarFooterActions'
import { sygnet } from 'src/assets/brand/sygnet'
import getDomoticaNav from '../../_nav.domotica'
import { setUi } from 'src/reducers/uiReducer'

const DomoticaSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const navigation = getDomoticaNav()

  return (
    <CSidebar
      className="border-end sidebar--domotica"
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
          <img src={logoDomotica} alt="Domótica" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
          <h3 className="mb-0" style={{ fontSize: '1.2rem' }}>Domótica</h3>
        </div>
        <CSidebarBrand to="/domotica/home">
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

export default React.memo(DomoticaSidebar)
