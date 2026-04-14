import React, { useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { cilSettings, cilBell, cilStorage } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import NotificationSettings from './tabs/NotificationSettings'
import StorageSettings from './tabs/StorageSettings'

const TABS = [
  { key: 'notifications', label: 'Notifications', icon: cilBell },
  { key: 'storage', label: 'Storage', icon: cilStorage },
]

const AppSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications')

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilSettings} />
        <strong>Configuración</strong>
      </CCardHeader>
      <CCardBody>
        <CNav variant="tabs" className="mb-3">
          {TABS.map((tab) => (
            <CNavItem key={tab.key}>
              <CNavLink
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={tab.icon} className="me-2" />
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>
        <CTabContent>
          <CTabPane visible={activeTab === 'notifications'}>
            <NotificationSettings />
          </CTabPane>
          <CTabPane visible={activeTab === 'storage'}>
            <StorageSettings />
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default AppSettings
