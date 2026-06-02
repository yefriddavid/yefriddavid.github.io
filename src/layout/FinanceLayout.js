import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppHeader, AppFooter, AppSidebar, ErrorBoundary } from '../components/index'
import FinanceContent from '../components/finance/FinanceContent'
import InstallBanner from '../components/shared/InstallBanner'
import NotificationToaster from '../components/shared/NotificationToaster'
import OfflineBanner from '../components/shared/OfflineBanner'
import { APP_NAME } from '../components/BrandName'
import { setUi } from 'src/reducers/uiReducer'

const FinanceLayout = () => {
  document.title = APP_NAME
  const dispatch = useDispatch()
  const headerShow = useSelector((s) => s.ui.headerShow)

  return (
    <div className="app-layout app-layout--finance">
      <AppSidebar />
      <div className="app-layout__content d-flex flex-column min-vh-100">
        {headerShow && <AppHeader />}
        {!headerShow && (
          <button
            onClick={() => dispatch(setUi({ headerShow: true }))}
            title="Mostrar cabecera"
            style={{
              position: 'fixed',
              top: 8,
              right: 12,
              zIndex: 1040,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.45)',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ▾
          </button>
        )}
        <div className="app-layout__body flex-grow-1">
          <ErrorBoundary module="finance">
            <FinanceContent />
          </ErrorBoundary>
        </div>
        <AppFooter />
      </div>
      <InstallBanner />
      <NotificationToaster />
      <OfflineBanner />
    </div>
  )
}

export default FinanceLayout
