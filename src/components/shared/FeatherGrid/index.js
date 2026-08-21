import React, { useState } from 'react'
import MultiSelectDropdown from '../MultiSelectDropdown'
import './FeatherGrid.scss'

// Plain-<table> grid shell — the MIT-licensed replacement for StandardGrid/
// DevExtreme in new screens (see CategoryMonthStatement.scss / CryptoQuery.js
// for the visual language this codifies). Only the sortable-header mechanics,
// scroll wrapper, amount coloring and total-row styling are generic here —
// row rendering (badges, grouping, editable cells, ...) stays screen-specific
// and is passed in as plain <tbody> children.

export const FeatherGrid = ({ children, className, ...rest }) => (
  <div className={`fg__scroll${className ? ` ${className}` : ''}`}>
    <table className="fg__table" {...rest}>
      {children}
    </table>
  </div>
)

// columns: [{ key, label, align: 'num', sortable: false }]
// leading/trailing: extra <th> nodes (checkboxes, expand chevrons, ...) that
// aren't part of the sortable column set.
export const FeatherSortHead = ({ columns, sort, onSort, leading, trailing }) => (
  <thead>
    <tr>
      {leading}
      {columns.map((col) => {
        if (col.sortable === false) {
          return (
            <th key={col.key} className={col.align === 'num' ? 'num' : undefined}>
              {col.label}
            </th>
          )
        }
        const sortIndex = sort.findIndex((s) => s.key === col.key)
        const active = sortIndex !== -1
        return (
          <th
            key={col.key}
            className={`fg__th--sortable${col.align === 'num' ? ' num' : ''}`}
            onClick={(e) => onSort(col.key, e.shiftKey)}
            title="Clic: ordenar por esta columna · Shift+clic: agregar como criterio adicional"
          >
            {col.label}
            {active && (
              <span className="fg__th-sort-arrow">
                {sort.length > 1 && <sup>{sortIndex + 1}</sup>}
                {sort[sortIndex].dir === 'asc' ? ' ▲' : ' ▼'}
              </span>
            )}
          </th>
        )
      })}
      {trailing}
    </tr>
  </thead>
)

export const FeatherAmount = ({ value, format = (n) => n, realized = false }) => {
  if (value == null) return <span className="fg__muted">—</span>
  const cls = realized
    ? 'fg__amount--realized'
    : value >= 0
      ? 'fg__amount--positive'
      : 'fg__amount--negative'
  return (
    <span className={`fg__amount ${cls}`}>
      {value >= 0 ? '+' : ''}
      {format(value)}
    </span>
  )
}

export const FeatherTotalRow = ({ children, className, net = false }) => (
  <tr
    className={`fg__total-row${net ? ' fg__total-row--net' : ''}${className ? ` ${className}` : ''}`}
  >
    {children}
  </tr>
)

// --- column visibility (reuses MultiSelectDropdown's own "empty selection =
// all shown" semantics — a column key toggled off materializes the rest as
// explicitly visible, same as any other filter in this app) ---

// columns: [{ key, label, ... }] — the same array passed to FeatherSortHead.
export const useFeatherColumns = (columns) => {
  const [selected, setSelected] = useState(new Set())
  const isVisible = (key) => selected.size === 0 || selected.has(key)
  const toggle = (value) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  return {
    columns: columns.filter((c) => isVisible(c.key)),
    isVisible,
    selected,
    toggle,
    clear: () => setSelected(new Set()),
  }
}

// Drop the returned `columns` (already filtered) into FeatherSortHead, and
// guard each screen-specific <td> with `isVisible('key')` in the body.
export const FeatherColumnToggle = ({ columns, selected, onToggle, onClearAll }) => (
  <MultiSelectDropdown
    label={(size) => (size > 0 ? `Columnas (${size})` : 'Columnas: Todas')}
    options={columns.map((c) => ({ value: c.key, label: c.label }))}
    selected={selected}
    onToggle={onToggle}
    onClearAll={onClearAll}
  />
)

// --- sort helpers (URL-agnostic — persist `sort` yourself, e.g. via
// useSearchParams, if a screen needs it to survive a refresh) ---

export const toggleFeatherSort = (current, key, additive) => {
  const existing = current.find((s) => s.key === key)
  if (!additive) {
    const dir = current.length === 1 && existing ? (existing.dir === 'asc' ? 'desc' : 'asc') : 'asc'
    return [{ key, dir }]
  }
  if (existing) {
    return current.map((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : s))
  }
  return [...current, { key, dir: 'asc' }]
}

export const sortFeatherRows = (list, sort, valueOf = (row, key) => row[key]) => {
  if (!sort.length) return list
  return [...list].sort((a, b) => {
    for (const { key, dir } of sort) {
      const av = valueOf(a, key)
      const bv = valueOf(b, key)
      const cmp =
        typeof av === 'string' || typeof bv === 'string'
          ? String(av ?? '').localeCompare(String(bv ?? ''))
          : (Number(av) || 0) - (Number(bv) || 0)
      if (cmp !== 0) return dir === 'asc' ? cmp : -cmp
    }
    return 0
  })
}

export const parseFeatherSort = (raw, defaultSort = []) => {
  if (!raw) return defaultSort
  const parsed = raw
    .split(',')
    .map((part) => {
      const [key, dir] = part.split(':')
      return key ? { key, dir: dir === 'asc' ? 'asc' : 'desc' } : null
    })
    .filter(Boolean)
  return parsed.length > 0 ? parsed : defaultSort
}

export const serializeFeatherSort = (sort) => sort.map((s) => `${s.key}:${s.dir}`).join(',')

// Local (non-URL) sort state — use parseFeatherSort/serializeFeatherSort
// directly against useSearchParams instead when a screen needs the sort to
// survive a page refresh (see CryptoQuery.js for that pattern).
export const useFeatherSort = (defaultSort = []) => {
  const [sort, setSort] = useState(defaultSort)
  const toggleSort = (key, additive) =>
    setSort((current) => toggleFeatherSort(current, key, additive))
  return [sort, toggleSort]
}
