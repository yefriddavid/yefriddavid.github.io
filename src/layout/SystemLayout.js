import React from 'react'
import { AppHeader, AppFooter } from '../components/index'
import SystemSidebar from '../components/system/SystemSidebar'
import SystemContent from '../components/system/SystemContent'

const SystemLayout = () => {
  document.title = 'System'

  return (
    <div className="app-layout">
      <SystemSidebar />
      <div className="app-layout__content d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="app-layout__body flex-grow-1">
          <SystemContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default SystemLayout
