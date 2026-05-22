import React, { useState } from 'react'
import CIcon from '@coreui/icons-react'
import './StandardList.scss'

// Cell content class helpers
export const SL = {
  label: 'sl-label',
  mono: 'sl-mono',
  muted: 'sl-muted',
}

const DEFAULT_PAGE_SIZE = 10

/**
 * StandardList — mobile-first list view with pagination.
 *
 * Props:
 *   data          array of records
 *   keyExpr       field name used as React key (default: 'id')
 *   pageSize      items per page (default: 10)
 *   emptyText     message when data is empty
 *   inactive      (item) => bool — dims the row when true
 *   renderTitle   (item) => string | ReactNode — bold top-left label
 *   renderBadge   (item) => { label, variant, onClick } | ReactNode — top-right pill
 *                   variant: 'active' | 'inactive' | 'warning' | 'default'
 *   renderRows    (item) => Array<Array<string | ReactNode | falsy>>
 *                   outer array = rows, inner array = cells; falsy cells are skipped
 *   renderActions (item) => Array<{ icon, color, title, onClick }>
 *                   color: 'primary' | 'danger' | 'warning'
 *
 * Cell helpers (import SL):
 *   <span className={SL.label}>Liq </span>   muted prefix label
 *   <span className={SL.mono}>ABC-123</span>  monospace plate / code
 *   <span className={SL.muted}>text</span>    secondary color
 */
const StandardList = ({
  data = [],
  keyExpr = 'id',
  pageSize = DEFAULT_PAGE_SIZE,
  emptyText = 'Sin registros.',
  inactive,
  renderTitle,
  renderBadge,
  renderRows,
  renderActions,
}) => {
  const [page, setPage] = useState(0)

  if (data.length === 0) {
    return <div className="sl__empty">{emptyText}</div>
  }

  const totalPages = Math.ceil(data.length / pageSize)
  const paged = data.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <>
      <ul className="sl">
        {paged.map((item) => {
          const key = item[keyExpr]
          const isInactive = inactive?.(item) ?? false
          const badge = renderBadge?.(item) ?? null
          const rows = (renderRows?.(item) ?? []).map((cells) => (cells ?? []).filter(Boolean))
          const actions = renderActions?.(item) ?? []

          return (
            <li key={key} className={`sl__item${isInactive ? ' sl__item--inactive' : ''}`}>
              <div className="sl__top">
                <span className="sl__title">{renderTitle ? renderTitle(item) : key}</span>
                <div className="sl__controls">
                  {badge && (
                    React.isValidElement(badge) ? badge : (
                      <button
                        type="button"
                        className={`sl__badge sl__badge--${badge.variant ?? 'default'}`}
                        onClick={badge.onClick}
                      >
                        {badge.label}
                      </button>
                    )
                  )}
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`sl__action-btn sl__action-btn--${action.color ?? 'default'}`}
                      onClick={action.onClick}
                      title={action.title}
                    >
                      <CIcon icon={action.icon} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
              {rows.some((r) => r.length > 0) && (
                <div className="sl__body">
                  {rows.map((cells, rowIdx) =>
                    cells.length > 0 ? (
                      <div key={rowIdx} className="sl__row">
                        {cells.map((cell, cellIdx) => (
                          <span key={cellIdx}>{cell}</span>
                        ))}
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {totalPages > 1 && (
        <div className="sl__pagination">
          <button
            type="button"
            className="sl__page-btn"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            ‹
          </button>
          <span className="sl__page-info">{page + 1} / {totalPages}</span>
          <button
            type="button"
            className="sl__page-btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}

export default StandardList
