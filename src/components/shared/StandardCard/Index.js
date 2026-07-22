import React, { useEffect, useState } from 'react'
import CIcon from '@coreui/icons-react'
import './StandardCard.scss'

/**
 * Cell content class helpers.
 *   SC.label  muted prefix  (e.g. "Liq ", "Cel ")
 *   SC.mono   monospace + bold  (plates, codes)
 *   SC.muted  secondary color
 *   SC.tag    small category pill
 */
export const SC = {
  label: 'sc-label',
  mono: 'sc-mono',
  muted: 'sc-muted',
  tag: 'sc-tag',
}

const DEFAULT_PAGE_SIZE = 10

const ActionButton = ({ action }) => (
  <button
    type="button"
    className={`sc__action-btn sc__action-btn--${action.color ?? 'default'}`}
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
      className={`sc__badge sc__badge--${badge.variant ?? 'default'}`}
      onClick={badge.onClick}
    >
      {badge.label}
    </button>
  )
}

/**
 * StandardCard — mobile card list with borders, pagination, and optional right-side value.
 *
 * Props:
 *   data          array of records
 *   keyExpr       key field name (default: 'id')
 *   pageSize      items per page (default: 10)
 *   emptyText     shown when data is empty
 *   inactive      (item) => bool — dims the card
 *   renderTitle   (item) => string | ReactNode  (can be multi-line)
 *   renderValue   (item) => string | ReactNode  prominent right-side value (amount, %, etc.)
 *   renderBadge   (item) => { label, variant, onClick } | ReactNode
 *                   variant: 'active' | 'inactive' | 'warning' | 'info' | 'default'
 *   renderRows    (item) => Array<Array<string | ReactNode | falsy>>
 *                   outer = rows, inner = cells; falsy cells are skipped
 *   renderActions (item) => Array<{ icon?, label?, color, title, onClick }>
 */
const StandardCard = ({
  data = [],
  keyExpr = 'id',
  pageSize = DEFAULT_PAGE_SIZE,
  emptyText = 'Sin registros.',
  inactive,
  renderTitle,
  renderValue,
  renderBadge,
  renderRows,
  renderActions,
}) => {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(data.length / pageSize)

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(totalPages - 1, 0))
  }, [totalPages, page])

  if (data.length === 0) return <div className="sc__empty">{emptyText}</div>

  const paged = data.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <>
      <div className="sc-list">
        {paged.map((item) => {
          const isInactive = inactive?.(item) ?? false
          const badge = renderBadge?.(item) ?? null
          const value = renderValue?.(item) ?? null
          const actions = renderActions?.(item) ?? []
          const rows = (renderRows?.(item) ?? []).map((r) => (r ?? []).filter(Boolean))
          const hasFooter = badge || actions.length > 0

          return (
            <div key={item[keyExpr]} className={`sc__card${isInactive ? ' sc__card--inactive' : ''}`}>
              <div className="sc__top">
                <div className="sc__head">
                  {renderTitle ? renderTitle(item) : item[keyExpr]}
                </div>
                {value != null && <div className="sc__value">{value}</div>}
              </div>

              {rows.some((r) => r.length > 0) && (
                <div className="sc__body">
                  {rows.map((cells, rowIdx) =>
                    cells.length > 0 ? (
                      <div key={rowIdx} className="sc__row">
                        {cells.map((cell, cellIdx) => <span key={cellIdx}>{cell}</span>)}
                      </div>
                    ) : null,
                  )}
                </div>
              )}

              {hasFooter && (
                <div className="sc__footer">
                  <div>{badge && <BadgeButton badge={badge} />}</div>
                  <div className="sc__actions">
                    {actions.map((a, i) => <ActionButton key={i} action={a} />)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="sc__pagination">
          <button type="button" className="sc__page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
          <span className="sc__page-info">{page + 1} / {totalPages}</span>
          <button type="button" className="sc__page-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
        </div>
      )}
    </>
  )
}

export default StandardCard
