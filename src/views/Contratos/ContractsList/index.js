import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import Spinner from 'src/components/shared/Spinner'
import * as contractActions from 'src/actions/contratos/contractActions'
import './ContractsList.scss'

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcDaysStatus(startDate) {
  if (!startDate) return null
  const start = new Date(startDate + 'T00:00:00')
  if (isNaN(start.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.floor((today - start) / 86_400_000)
  if (days <= 0) return null

  if (days < 365) {
    const remaining = 365 - days
    return { overdue: false, ok: remaining > 60, remaining, past: null }
  }

  // Past the first anniversary — days since most recent yearly anniversary
  const past = days % 365
  return { overdue: true, ok: false, remaining: null, past }
}

function fmtCOP(v) {
  return v ? `$${String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '—'
}

function DaysBadge({ startDate }) {
  const s = calcDaysStatus(startDate)
  if (!s) return <span className="cl-badge cl-badge--default">Sin fecha</span>
  if (s.overdue)
    return (
      <span className="cl-badge cl-badge--overdue">
        {s.past === 0 ? 'Hoy vence' : `+${s.past} días`}
      </span>
    )
  if (!s.ok)
    return <span className="cl-badge cl-badge--warning">{s.remaining} días</span>
  return <span className="cl-badge cl-badge--ok">{Math.ceil(s.remaining / 30)} meses</span>
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ContractsList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const records = useSelector((s) => s.contrato.summary)
  const loading = useSelector((s) => s.contrato.summaryFetching)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    dispatch(contractActions.fetchSummaryRequest())
  }, [dispatch])

  const visibleRecords = useMemo(
    () => (records ? records.filter((d) => showArchived || !d.archived) : null),
    [records, showArchived],
  )

  const stats = useMemo(() => {
    if (!records) return null
    return records.filter((d) => !d.archived).reduce(
      (acc, d) => {
        const s = calcDaysStatus(d.rental_start_date)
        if (!s) acc.noDate++
        else if (s.overdue) acc.overdue++
        else if (!s.ok) acc.warning++
        else acc.ok++
        acc.total++
        return acc
      },
      { total: 0, overdue: 0, warning: 0, ok: 0, noDate: 0 },
    )
  }, [records])

  const handleOpen = useCallback(
    (id) => navigate(`/contratos/generar?id=${id}`),
    [navigate],
  )

  if (loading && !records) return <Spinner mode="section" />

  return (
    <div className="cl">
      <div className="cl__header">
        <h2 className="cl__header-title">Contratos — Actualización de canon</h2>
        <button
          type="button"
          className={`btn btn-sm ${showArchived ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? 'Ocultar archivados' : 'Mostrar archivados'}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => dispatch(contractActions.fetchSummaryRequest())}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : '↻'} Actualizar
        </button>
      </div>

      {stats && (
        <div className="cl__stats">
          <span className="cl__stat cl__stat--total">
            <span className="cl__dot cl__dot--total" />
            {stats.total} contratos
          </span>
          {stats.overdue > 0 && (
            <span className="cl__stat cl__stat--overdue">
              <span className="cl__dot cl__dot--overdue" />
              {stats.overdue} vencido{stats.overdue !== 1 ? 's' : ''}
            </span>
          )}
          {stats.warning > 0 && (
            <span className="cl__stat cl__stat--warning">
              <span className="cl__dot cl__dot--warning" />
              {stats.warning} por vencer
            </span>
          )}
          {stats.ok > 0 && (
            <span className="cl__stat cl__stat--ok">
              <span className="cl__dot cl__dot--ok" />
              {stats.ok} vigente{stats.ok !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      <StandardList
        data={visibleRecords || []}
        keyExpr="id"
        emptyText="Sin contratos."
        inactive={(d) => d.archived}
        renderTitle={(d) => d.name}
        renderBadge={(d) => {
          const s = calcDaysStatus(d.rental_start_date)
          if (!s) return null
          if (s.overdue)
            return { label: s.past === 0 ? 'Hoy' : `+${s.past}d`, variant: 'inactive' }
          if (!s.ok) return { label: `${s.remaining}d`, variant: 'warning' }
          return { label: `${Math.ceil(s.remaining / 30)}m`, variant: 'active' }
        }}
        renderValue={(d) => (d.rental_value ? fmtCOP(d.rental_value) : null)}
        renderRows={(d) => [
          [d.tenant_name || <span className={SL.muted}>Sin inquilino</span>],
          [d.property_address || <span className={SL.muted}>Sin inmueble</span>],
          [
            d.rental_start_date
              ? <><span className={SL.label}>Inicio </span>{d.rental_start_date}</>
              : null,
            d.rental_payment_day
              ? <><span className={SL.label}>Paga </span><span className={SL.mono}>{`día ${d.rental_payment_day}`}</span></>
              : null,
            <DaysBadge key="badge" startDate={d.rental_start_date} />,
          ],
        ]}
        renderActions={(d) => [
          { label: '✏️', color: 'primary', title: 'Abrir en editor', onClick: () => handleOpen(d.id) },
        ]}
      />
    </div>
  )
}
