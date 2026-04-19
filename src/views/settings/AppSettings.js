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
import { cilSettings, cilBell, cilStorage, cilCode, cilOptions } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import NotificationSettings from './tabs/NotificationSettings'
import StorageSettings from './tabs/StorageSettings'
import AppVariablesSettings from './tabs/AppVariablesSettings'
import DisplayPreferences from './tabs/DisplayPreferences'

const TABS = [
  { key: 'notifications', label: 'Notifications', icon: cilBell },
  { key: 'storage', label: 'Storage', icon: cilStorage },
  { key: 'variables', label: 'App Variables', icon: cilCode },
  { key: 'display', label: 'Preferencias', icon: cilOptions },
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
          <CTabPane visible={activeTab === 'variables'}>
            <AppVariablesSettings />
          </CTabPane>
          <CTabPane visible={activeTab === 'display'}>
            <DisplayPreferences />
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default AppSettings
