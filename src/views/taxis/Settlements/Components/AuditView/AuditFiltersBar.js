import React from 'react'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import { AUDIT_COL_DEFS } from './auditConstants'

const AuditFiltersBar = ({
  auditVehicles,
  auditPlateFilter,
  setAuditPlateFilter,
  auditDrivers,
  auditDriverFilter,
  setAuditDriverFilter,
  setAuditStatusFilter,
  hasFilters,
  selected,
  setSelected,
  showColMgr,
  setShowColMgr,
  colMgrPos,
  setColMgrPos,
  colMgrRef,
  colOrder,
  visibleCols,
  toggleCol,
  reorderCol,
  resetCols,
  draggedColRef,
  setShowInstructions,
  openAnalysis,
  exportAuditToExcel,
  exportAuditToPdf,
  toggleFullscreen,
  isFullscreen,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 12,
        alignItems: 'center',
      }}
    >
      <select
        value={auditPlateFilter}
        onChange={(e) => setAuditPlateFilter(e.target.value)}
        style={{
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid var(--cui-secondary)',
          background: auditPlateFilter ? 'rgba(var(--cui-primary-rgb), 0.1)' : 'var(--cui-card-bg)',
          color: auditPlateFilter ? 'var(--cui-primary)' : 'var(--cui-secondary)',
          fontWeight: auditPlateFilter ? 600 : 400,
          cursor: 'pointer',
        }}
      >
        <option value="">Vehículo: Todos</option>
        {auditVehicles.map((pl) => (
          <option key={pl} value={pl}>
            {pl}
          </option>
        ))}
      </select>

      <MultiSelectDropdown
        label={(size) => (size > 0 ? `Conductor (${size})` : 'Conductor: Todos')}
        options={auditDrivers.map((dr) => ({ value: dr, label: dr }))}
        selected={auditDriverFilter}
        onToggle={(dr) =>
          setAuditDriverFilter((prev) => {
            const next = new Set(prev)
            next.has(dr) ? next.delete(dr) : next.add(dr)
            return next
          })
        }
        onClearAll={() => setAuditDriverFilter(new Set())}
        acceptLabel="Aceptar"
      />

      {hasFilters && (
        <button
          onClick={() => {
            setAuditPlateFilter('')
            setAuditDriverFilter(new Set())
            setAuditStatusFilter(new Set())
          }}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--cui-danger)',
            background: 'none',
            color: 'var(--cui-danger)',
            cursor: 'pointer',
          }}
        >
          ✕ Limpiar
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>Mode:</span>
        {[
          {
            value: 'edicion',
            label: 'Edición',
            active: 'var(--cui-success)',
            activeBg: 'rgba(var(--cui-success-rgb), 0.12)',
          },
          {
            value: 'simulacro',
            label: 'Simulacro',
            active: 'var(--cui-danger)',
            activeBg: 'rgba(var(--cui-danger-rgb), 0.12)',
          },
        ].map(({ value, label, active, activeBg }) => (
          <button
            key={value}
            onClick={() => setSelected(value)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '3px 12px',
              borderRadius: 5,
              border: `1.5px solid ${selected === value ? active : 'var(--cui-border-color)'}`,
              background: selected === value ? activeBg : 'transparent',
              color: selected === value ? active : 'var(--cui-secondary-color)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          marginLeft: 'auto',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          marginTop: 4,
        }}
      >
        {/* Column manager */}
        <div ref={colMgrRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowColMgr((v) => {
                if (!v && colMgrRef.current) {
                  const rect = colMgrRef.current.getBoundingClientRect()
                  const dropdownWidth = 180
                  const left =
                    rect.right - dropdownWidth < 8
                      ? Math.max(8, rect.left)
                      : rect.right - dropdownWidth
                  setColMgrPos({ top: rect.bottom + 4, left })
                }
                return !v
              })
            }}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${showColMgr ? 'var(--cui-primary)' : 'var(--cui-border-color)'}`,
              background: showColMgr ? 'rgba(var(--cui-primary-rgb), 0.1)' : 'none',
              color: showColMgr ? 'var(--cui-primary)' : 'var(--cui-secondary-color)',
              cursor: 'pointer',
            }}
            title="Mostrar/ocultar columnas"
          >
            ⊞ Columnas
          </button>
          {showColMgr && (
            <div
              style={{
                position: 'fixed',
                top: colMgrPos.top,
                left: colMgrPos.left,
                background: 'var(--cui-card-bg)',
                border: '1px solid var(--cui-border-color)',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                padding: '8px 4px',
                zIndex: 1050,
                minWidth: 160,
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
            >
              {colOrder.map((key) => {
                const def = AUDIT_COL_DEFS.find((c) => c.key === key)
                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => {
                      draggedColRef.current = key
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => reorderCol(draggedColRef.current, key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px 4px 6px',
                      borderRadius: 5,
                      background: visibleCols[key] ? 'transparent' : 'var(--cui-tertiary-bg)',
                      cursor: 'grab',
                    }}
                  >
                    <span style={{ color: 'var(--cui-secondary-color)', fontSize: 14, flexShrink: 0 }}>
                      ⠿
                    </span>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        cursor: 'pointer',
                        flex: 1,
                        color: visibleCols[key] ? 'var(--cui-primary)' : 'var(--cui-secondary-color)',
                        fontSize: 12,
                        fontWeight: visibleCols[key] ? 500 : 400,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!visibleCols[key]}
                        onChange={() => toggleCol(key)}
                        style={{ accentColor: 'var(--cui-primary)', cursor: 'pointer' }}
                      />
                      {def.label}
                    </label>
                  </div>
                )
              })}
              <div style={{ borderTop: '1px solid var(--cui-border-color)', margin: '6px 12px 2px' }} />
              <button
                onClick={resetCols}
                style={{
                  fontSize: 11,
                  padding: '3px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--cui-secondary-color)',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                Restablecer todo
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowInstructions(true)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 6,
            border: '1.5px solid var(--cui-primary)',
            background: 'rgba(var(--cui-primary-rgb), 0.08)',
            color: 'var(--cui-primary)',
            cursor: 'pointer',
          }}
          title="Instrucciones para llenar el libro contable"
        >
          📖 Instrucciones
        </button>
        <button
          onClick={openAnalysis}
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 6,
            border: '1.5px solid #7c3aed',
            background: 'rgba(124, 58, 237, 0.08)',
            color: '#7c3aed',
            cursor: 'pointer',
          }}
          title="Análisis automático del período"
        >
          ✦ Análisis IA
        </button>
        <button
          onClick={exportAuditToExcel}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--cui-success)',
            background: 'none',
            color: 'var(--cui-success)',
            cursor: 'pointer',
          }}
          title="Exportar auditoría a Excel"
        >
          ↓ Excel
        </button>
        <button
          onClick={exportAuditToPdf}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--cui-danger)',
            background: 'none',
            color: 'var(--cui-danger)',
            cursor: 'pointer',
          }}
          title="Exportar auditoría a PDF"
        >
          ↓ PDF
        </button>
        <button
          onClick={toggleFullscreen}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 6,
            border: `1px solid ${isFullscreen ? 'var(--cui-primary)' : 'var(--cui-border-color)'}`,
            background: isFullscreen ? 'rgba(var(--cui-primary-rgb), 0.1)' : 'none',
            color: isFullscreen ? 'var(--cui-primary)' : 'var(--cui-secondary-color)',
            cursor: 'pointer',
          }}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Vista pantalla completa'}
        >
          {isFullscreen ? '⊡ Salir' : '⛶ Pantalla completa'}
        </button>
      </div>
    </div>
  )
}

export default AuditFiltersBar
