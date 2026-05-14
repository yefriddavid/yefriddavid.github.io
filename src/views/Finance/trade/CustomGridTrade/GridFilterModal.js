import React from 'react'

const GridFilterModal = ({
  filterOpen,
  setFilterOpen,
  filterInput,
  setFilterInput,
  priceFilter,
  setPriceFilter,
  fmt,
}) => {
  if (!filterOpen) return null
  return (
    <div
      onClick={() => setFilterOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '24px 24px 20px',
          width: 360,
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0d1117', marginBottom: 8 }}>
          Filtrar por inversión
        </div>
        <div style={{ fontSize: 13, color: '#868e96', marginBottom: 16 }}>
          Mostrar solo trades con valor invertido (precio × cantidad) <strong>mayor a</strong>:
        </div>
        <div style={{ display: 'flex', marginBottom: 20 }}>
          <span
            style={{
              padding: '9px 12px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              fontWeight: 700,
              fontSize: 14,
              color: '#495057',
            }}
          >
            $
          </span>
          <input
            type="number"
            step="any"
            autoFocus
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filterInput) {
                setPriceFilter(Number(filterInput))
                setFilterOpen(false)
              }
              if (e.key === 'Escape') setFilterOpen(false)
            }}
            placeholder="ej. 500"
            style={{
              flex: 1,
              padding: '9px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '0 8px 8px 0',
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {priceFilter !== null && (
            <button
              onClick={() => {
                setPriceFilter(null)
                setFilterOpen(false)
              }}
              style={{
                marginRight: 'auto',
                border: 'none',
                background: 'none',
                color: '#e03131',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 4px',
              }}
            >
              Quitar filtro
            </button>
          )}
          <button
            onClick={() => setFilterOpen(false)}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: '1px solid #dee2e6',
              background: '#fff',
              fontSize: 14,
              fontWeight: 600,
              color: '#868e96',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            disabled={!filterInput}
            onClick={() => {
              setPriceFilter(Number(filterInput))
              setFilterOpen(false)
            }}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              background: filterInput ? '#0d1117' : '#e9ecef',
              color: filterInput ? '#fff' : '#adb5bd',
              fontSize: 14,
              fontWeight: 700,
              cursor: filterInput ? 'pointer' : 'not-allowed',
            }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

export default GridFilterModal
