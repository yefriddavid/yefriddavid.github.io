import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import InstallBanner from '../components/shared/InstallBanner'

const DefaultLayout = () => {
  document.title = `Cash Flow`

  return (
    <div className="app-layout">
      <AppSidebar />
      <div className="app-layout__content d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="app-layout__body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
      <InstallBanner />
    </div>
  )
}

export default DefaultLayout
