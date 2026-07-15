import React from 'react'
import { fmt } from 'src/utils/formatters'
import './CategoryMonthStatement.scss'

const sumMonth = (matrix, m) => matrix.reduce((s, row) => s + row[m], 0)

const CategoryDetailRow = ({ months, records, type, category, categoryGroups, year }) => {
  const members = categoryGroups[category] || [category]

  return (
    <tr className="cms__detail-row">
      <td />
      {months.map((_, m) => {
        const items = records.filter(
          (r) =>
            r.type === type &&
            members.includes(r.category || 'Otros') &&
            r.date?.slice(0, 4) === String(year) &&
            Number(r.date.slice(5, 7)) - 1 === m,
        )
        return (
          <td key={m} className="cms__detail-cell">
            {items.length > 0 && (
              <ul className="cms__detail-list">
                {items.map((r) => (
                  <li key={r.id}>
                    <span className="cms__detail-date">{r.date.slice(8, 10)}</span>{' '}
                    <span className="cms__detail-desc">{r.description || '—'}</span>{' '}
                    <span className="cms__detail-amount">{fmt(r.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </td>
        )
      })}
      <td />
    </tr>
  )
}

const StatementSection = ({
  title,
  months,
  categories,
  matrix,
  modifier,
  categoryGroups,
  records,
  type,
  year,
  expanded,
  onToggle,
}) => {
  const monthTotals = months.map((_, m) => sumMonth(matrix, m))
  const rowTotals = matrix.map((row) => row.reduce((s, v) => s + v, 0))
  const sectionTotal = rowTotals.reduce((s, v) => s + v, 0)

  return (
    <>
      <tr className={`cms__section-row cms__section-row--${modifier}`}>
        <td colSpan={months.length + 2}>{title}</td>
      </tr>
      {categories.map((cat, i) => {
        const key = `${type}:${cat}`
        const isOpen = expanded.has(key)
        return (
          <React.Fragment key={cat}>
            <tr className="cms__row cms__row--clickable" onClick={() => onToggle(key)}>
              <td className="cms__row-label">
                <span className="cms__row-toggle">{isOpen ? '▾' : '▸'}</span> {cat}
              </td>
              {matrix[i].map((v, m) => (
                <td key={m}>{v ? fmt(v) : '—'}</td>
              ))}
              <td className="cms__total-cell">{fmt(rowTotals[i])}</td>
            </tr>
            {isOpen && (
              <CategoryDetailRow
                months={months}
                records={records}
                type={type}
                category={cat}
                categoryGroups={categoryGroups}
                year={year}
              />
            )}
          </React.Fragment>
        )
      })}
      <tr className="cms__subtotal-row">
        <td>Total {title}</td>
        {monthTotals.map((v, m) => (
          <td key={m}>{fmt(v)}</td>
        ))}
        <td className="cms__total-cell">{fmt(sectionTotal)}</td>
      </tr>
    </>
  )
}

/**
 * Generic categories × months statement table with click-to-expand,
 * per-record drill-down. Used by Finance's Estado de Resultados and Taxis'
 * Resumen Anual — each caller normalizes its own domain records into
 * { id, date, type, category, amount, description } before passing them in.
 *
 * @param {string[]} months - short month labels (e.g. ['ene','feb',...])
 * @param {{title, modifier, type, categories, matrix, categoryGroups}[]} sections
 * @param {object[]} records - normalized records, used for the drill-down rows
 * @param {number} year
 * @param {Set<string>} expanded - keys of currently expanded "type:category" rows
 * @param {(key: string) => void} onToggle
 * @param {string} netLabel
 * @param {number[]} netMonthTotals - one net value per month
 * @param {number} netTotal
 */
const CategoryMonthStatement = ({
  months,
  sections,
  records,
  year,
  expanded,
  onToggle,
  netLabel,
  netMonthTotals,
  netTotal,
}) => (
  <table className="cms__table">
    <thead>
      <tr>
        <th>Categoría</th>
        {months.map((m) => (
          <th key={m}>{m}</th>
        ))}
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {sections.map((section) => (
        <StatementSection
          key={section.type}
          {...section}
          months={months}
          records={records}
          year={year}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </tbody>
    <tfoot>
      <tr className="cms__net-row">
        <td>{netLabel}</td>
        {netMonthTotals.map((v, m) => (
          <td key={m} className={v >= 0 ? 'cms__net-positive' : 'cms__net-negative'}>
            {fmt(v)}
          </td>
        ))}
        <td className={netTotal >= 0 ? 'cms__net-positive' : 'cms__net-negative'}>
          {fmt(netTotal)}
        </td>
      </tr>
    </tfoot>
  </table>
)

export default CategoryMonthStatement
