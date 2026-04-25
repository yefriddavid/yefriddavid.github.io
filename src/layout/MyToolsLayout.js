import React from 'react'
import { AppHeader, AppFooter } from '../components/index'
import MyToolsSidebar from '../components/mytools/MyToolsSidebar'
import MyToolsContent from '../components/mytools/MyToolsContent'

const MyToolsLayout = () => {
  document.title = 'My Tools'

  return (
    <div className="app-layout">
      <MyToolsSidebar />
      <div className="app-layout__content d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="app-layout__body flex-grow-1">
          <MyToolsContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default MyToolsLayout
