import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { CNav, CNavItem, CNavLink, CTabContent, CTabPane, CFormCheck } from '@coreui/react'
import * as actions from 'src/actions/finance/customGridTradeActions'
import TradeVisualGrid from './TradeVisualGrid'
import TradesTab from './TradesTab'

const TAB_PARAM = 'tab'
const TABS = { grids: 1, trades: 2 }
const TAB_KEYS = { 1: 'grids', 2: 'trades' }

export default function CustomGridTrade() {
  const dispatch = useDispatch()
  const { trades, loading, saving, useIndexedDB } = useSelector((s) => s.customGridTrade)
  const [searchParams, setSearchParams] = useSearchParams()
  const gridRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const activeTab = TABS[searchParams.get(TAB_PARAM)] ?? 1
  const setActiveTab = (tab) => setSearchParams({ [TAB_PARAM]: TAB_KEYS[tab] }, { replace: true })

  const handleStorageToggle = (e) => {
    dispatch(actions.setStorage(e.target.checked))
    dispatch(actions.loadRequest())
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gridRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CFormCheck
            id="storage-toggle"
            label={useIndexedDB ? 'IndexedDB' : 'Firebase'}
            checked={useIndexedDB}
            onChange={handleStorageToggle}
            title="Fuente de datos: IndexedDB (local) o Firebase (nube)"
          />
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1.5px solid #dee2e6',
              background: '#fff',
              color: '#495057',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {isFullscreen ? (
                // compress icon
                <>
                  <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </>
              ) : (
                // expand icon
                <>
                  <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </>
              )}
            </svg>
          </button>
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
            ref={gridRef}
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
