import React from 'react'

const fabStyle = (borderColor, color, glow = false) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: `2px solid ${borderColor}`,
  background: '#0d1117',
  color,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: glow ? `0 0 8px ${borderColor}55` : 'none',
})

const GridActionButtons = ({
  textScale,
  setTextScale,
  visibleLevels,
  setVisibleLevels,
  priceFilter,
  setPriceFilter,
  setFilterInput,
  openFilterDialog,
  isFullscreen,
  toggleFullscreen,
  hiddenTrades,
  toggleHideAll,
  showHiddenOnly,
  setShowHiddenOnly,
  snakeLayout,
  setSnakeLayout,
  panEnabled,
  setPanEnabled,
  centerView,
  fmt,
}) => (
  <div
    style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1030,
      display: 'flex',
      gap: 8,
    }}
  >
    {/* Text scale */}
    <button
      onClick={() => setTextScale((v) => Math.max(0.5, +(v - 0.25).toFixed(2)))}
      title="Texto más pequeño"
      style={{ ...fabStyle('#e2e8f0', '#e2e8f0'), fontSize: 13, fontWeight: 'bold' }}
    >
      A−
    </button>
    <button
      onClick={() => setTextScale((v) => Math.min(3, +(v + 0.25).toFixed(2)))}
      title="Texto más grande"
      style={{ ...fabStyle('#e2e8f0', '#e2e8f0'), fontSize: 13, fontWeight: 'bold' }}
    >
      A+
    </button>

    {/* Zoom */}
    <button
      onClick={() => setVisibleLevels((v) => Math.min(30, v + 3))}
      title="Zoom out"
      style={{ ...fabStyle('#8b949e', '#8b949e'), fontSize: 20, fontWeight: 'bold' }}
    >
      −
    </button>
    <button
      onClick={() => setVisibleLevels((v) => Math.max(5, v - 3))}
      title="Zoom in"
      style={{ ...fabStyle('#8b949e', '#8b949e'), fontSize: 20, fontWeight: 'bold' }}
    >
      +
    </button>

    {/* Price filter */}
    <button
      onClick={openFilterDialog}
      title={
        priceFilter !== null
          ? `Filtrando > ${fmt(priceFilter)} — click para cambiar`
          : 'Filtrar por precio mínimo'
      }
      style={{
        height: 40,
        padding: '0 12px',
        borderRadius: 20,
        border: `2px solid ${priceFilter !== null ? '#f59e0b' : '#8b949e'}`,
        background: '#0d1117',
        color: priceFilter !== null ? '#f59e0b' : '#8b949e',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'monospace',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        boxShadow: priceFilter !== null ? '0 0 8px #f59e0b55' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {priceFilter !== null ? (
        <>
          <span>&gt;</span>
          <span>{fmt(priceFilter)}</span>
          <span
            onClick={(e) => {
              e.stopPropagation()
              setPriceFilter(null)
            }}
            style={{ marginLeft: 2, opacity: 0.7, fontSize: 13 }}
          >
            ×
          </span>
        </>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M1 3h14M3 8h10M6 13h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>

    <div style={{ width: 1, height: 24, background: '#3b4452', alignSelf: 'center' }} />

    {/* Fullscreen */}
    <button
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      style={fabStyle('#8b949e', '#8b949e')}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {isFullscreen ? (
          <path
            d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>

    {/* Hide all toggle */}
    <button
      onClick={toggleHideAll}
      title={hiddenTrades.size > 0 ? 'Mostrar todos' : 'Ocultar todos'}
      style={fabStyle(
        hiddenTrades.size > 0 ? '#4b5563' : '#a78bfa',
        hiddenTrades.size > 0 ? '#4b5563' : '#a78bfa',
        hiddenTrades.size === 0,
      )}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
        {hiddenTrades.size === 0 && (
          <polyline
            points="5,10 8,14 15,6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>

    {/* Show hidden only */}
    <button
      onClick={() => setShowHiddenOnly((v) => !v)}
      title={showHiddenOnly ? 'Volver a trades visibles' : 'Ver solo trades ocultos'}
      style={fabStyle(
        showHiddenOnly ? '#fb923c' : '#4b5563',
        showHiddenOnly ? '#fb923c' : '#4b5563',
        showHiddenOnly,
      )}
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line
          x1="3"
          y1="13"
          x2="13"
          y2="3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>

    {/* Snake layout */}
    <button
      onClick={() => setSnakeLayout((v) => !v)}
      title={snakeLayout ? 'Modo vertical' : 'Modo culebrita'}
      style={fabStyle(
        snakeLayout ? '#f59e0b' : '#8b949e',
        snakeLayout ? '#f59e0b' : '#8b949e',
        snakeLayout,
      )}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polyline
          points="2,16 6,6 10,16 14,6 18,16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

    {/* Pan toggle */}
    <button
      onClick={() => setPanEnabled((v) => !v)}
      title={panEnabled ? 'Bloquear navegación' : 'Activar navegación'}
      style={{
        ...fabStyle(panEnabled ? '#4ade80' : '#f87171', panEnabled ? '#4ade80' : '#f87171', true),
        fontSize: 16,
        boxShadow: `0 0 8px ${panEnabled ? '#4ade8055' : '#f8717155'}`,
      }}
    >
      {panEnabled ? '🔓' : '🔒'}
    </button>

    {/* Center view */}
    <button
      onClick={centerView}
      title="Centrar en precio actual"
      style={{
        ...fabStyle('#00ffff', '#00ffff', true),
        fontSize: 18,
        boxShadow: '0 0 8px #00ffff55',
      }}
    >
      ⊕
    </button>
  </div>
)

export default GridActionButtons
