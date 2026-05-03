import React, { useState } from 'react'
import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'
import TradeVisualGrid from './TradeVisualGrid'

export default function CustomGridTrade() {
  const [activeTab, setActiveTab] = useState(1)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 0 14px',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0d1117' }}>Custom Grid Trades</div>
          <div style={{ fontSize: 13, color: '#868e96', marginTop: 2 }}>
            Vista de referencia visual
          </div>
        </div>
      </div>

      <CNav variant="tabs">
        <CNavItem>
          <CNavLink
            component="button"
            active={activeTab === 1}
            onClick={() => setActiveTab(1)}
          >
            Grids
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            component="button"
            active={activeTab === 2}
            onClick={() => setActiveTab(2)}
          >
            Resumen
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === 1}>
          <div style={{ padding: '24px 0', background: '#0d1117', borderRadius: 16, marginTop: 16 }}>
            <TradeVisualGrid />
          </div>
        </CTabPane>
        <CTabPane visible={activeTab === 2}>
          <div style={{ padding: '24px 0' }}>
            <h4>Resumen</h4>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                border: '1px solid #dee2e6',
                marginTop: 16,
              }}
            >
              <p style={{ color: '#868e96' }}>Esta es una vista previa estática del grid.</p>
            </div>
          </div>
        </CTabPane>
      </CTabContent>
    </div>
  )
}
