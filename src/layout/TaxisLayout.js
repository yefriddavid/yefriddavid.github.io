import React from 'react'
import { AppHeader, AppFooter } from '../components/index'
import TaxisSidebar from '../components/taxis/TaxisSidebar'
import TaxisContent from '../components/taxis/TaxisContent'

const TaxisLayout = () => {
  document.title = 'Gestión de Taxis'

  return (
    <div className="app-layout">
      <TaxisSidebar />
      <div className="app-layout__content d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="app-layout__body flex-grow-1">
          <TaxisContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default TaxisLayout
