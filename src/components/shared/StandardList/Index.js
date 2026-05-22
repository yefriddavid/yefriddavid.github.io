import React, { useState } from 'react'
import CIcon from '@coreui/icons-react'
import './StandardList.scss'

/**
 * Cell content class helpers.
 *   SL.label  muted prefix  (e.g. "Liq ", "Cel ")
 *   SL.mono   monospace + bold  (plates, codes)
 *   SL.muted  secondary color
 */
export const SL = {
  label: 'sl-label',
  mono: 'sl-mono',
  muted: 'sl-muted',
}

const DEFAULT_PAGE_SIZE = 10

const ActionButton = ({ action }) => (
  <button
    type="button"
    className={`sl__action-btn sl__action-btn--${action.color ?? 'default'}`}
    onClick={action.onClick}
    title={action.title}
  >
    {action.icon ? <CIcon icon={action.icon} size="sm" /> : action.label}
  </button>
)

const BadgeButton = ({ badge }) => {
  if (React.isValidElement(badge)) return badge
  return (
    <button
      type="button"
      className={`sl__badge sl__badge--${badge.variant ?? 'default'}`}
      onClick={badge.onClick}
    >
      {badge.label}
    </button>
  )
}

/**
 * StandardList — compact mobile list with dividers and pagination.
 *
 * Props:
 *   data          array of records
 *   keyExpr       key field name (default: 'id')
 *   pageSize      items per page (default: 10)
 *   emptyText     shown when data is empty
 *   inactive      (item) => bool — dims the row
 *   renderTitle   (item) => string | ReactNode
 *   renderBadge   (item) => { label, variant, onClick } | ReactNode
 *                   variant: 'active' | 'inactive' | 'warning' | 'info' | 'default'
 *   renderRows    (item) => Array<Array<string | ReactNode | falsy>>
 *                   outer = rows, inner = cells; falsy cells are skipped
 *   renderActions (item) => Array<{ icon?, label?, color, title, onClick }>
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

  if (data.length === 0) return <div className="sl__empty">{emptyText}</div>

  const totalPages = Math.ceil(data.length / pageSize)
  const paged = data.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <>
      <ul className="sl">
        {paged.map((item) => {
          const isInactive = inactive?.(item) ?? false
          const badge = renderBadge?.(item) ?? null
          const actions = renderActions?.(item) ?? []
          const rows = (renderRows?.(item) ?? []).map((r) => (r ?? []).filter(Boolean))

          return (
            <li key={item[keyExpr]} className={`sl__item${isInactive ? ' sl__item--inactive' : ''}`}>
              <div className="sl__top">
                <span className="sl__title">{renderTitle ? renderTitle(item) : item[keyExpr]}</span>
                <div className="sl__controls">
                  {badge && <BadgeButton badge={badge} />}
                  {actions.map((a, i) => <ActionButton key={i} action={a} />)}
                </div>
              </div>
              {rows.some((r) => r.length > 0) && (
                <div className="sl__body">
                  {rows.map((cells, rowIdx) =>
                    cells.length > 0 ? (
                      <div key={rowIdx} className="sl__row">
                        {cells.map((cell, cellIdx) => <span key={cellIdx}>{cell}</span>)}
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
          <button type="button" className="sl__page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
          <span className="sl__page-info">{page + 1} / {totalPages}</span>
          <button type="button" className="sl__page-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
        </div>
      )}
    </>
  )
}

export default StandardList
