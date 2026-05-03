import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'
import * as actions from 'src/actions/finance/customGridTradeActions'
import TradeVisualGrid from './TradeVisualGrid'
import TradesTab from './TradesTab'

export default function CustomGridTrade() {
  const dispatch = useDispatch()
  const { trades, loading, saving } = useSelector((s) => s.customGridTrade)
  const [activeTab, setActiveTab] = useState(1)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

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
            {trades.length} trade{trades.length !== 1 ? 's' : ''} registrado
            {trades.length !== 1 ? 's' : ''}
            {loading && ' · cargando…'}
          </div>
        </div>
      </div>

      <CNav variant="tabs">
        <CNavItem>
          <CNavLink component="button" active={activeTab === 1} onClick={() => setActiveTab(1)}>
            Grids
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink component="button" active={activeTab === 2} onClick={() => setActiveTab(2)}>
            Trades
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === 1}>
          <div
            style={{ padding: '24px 0', background: '#0d1117', borderRadius: 16, marginTop: 16 }}
          >
            <TradeVisualGrid transactions={trades} />
          </div>
        </CTabPane>
        <CTabPane visible={activeTab === 2}>
          <TradesTab trades={trades} saving={saving} />
        </CTabPane>
      </CTabContent>
    </div>
  )
}
