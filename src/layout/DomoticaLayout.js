import React from 'react'
import { AppHeader, AppFooter } from '../components/index'
import DomoticaSidebar from '../components/domotica/DomoticaSidebar'
import DomoticaContent from '../components/domotica/DomoticaContent'

const DomoticaLayout = () => {
  document.title = 'Domótica'

  return (
    <div className="app-layout">
      <DomoticaSidebar />
      <div className="app-layout__content d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="app-layout__body flex-grow-1">
          <DomoticaContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DomoticaLayout
