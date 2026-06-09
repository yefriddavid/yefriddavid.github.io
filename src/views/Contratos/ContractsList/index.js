import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Column, Paging, FilterRow, Toolbar, Item } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import Spinner from 'src/components/shared/Spinner'
import useIsMobile from 'src/hooks/useIsMobile'
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
    return { sortValue: -remaining, overdue: false, ok: remaining > 60, remaining, past: null }
  }

  // Past the first anniversary — show days since most recent yearly anniversary
  const past = days % 365
  return { sortValue: past, overdue: true, ok: false, remaining: null, past }
}

function calcSortValue(d) {
  const s = calcDaysStatus(d.rental_start_date)
  return s ? s.sortValue : null
}

function fmtCOP(v) {
  return v ? `$${String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '—'
}

function fmtPayDay(day) {
  if (!day) return '—'
  return `Día ${day}`
}

// ─── Grid cell renders (module-level = stable references) ───────────────────

function renderDaysCell({ value }) {
  if (value === null || value === undefined)
    return <span className="cl-badge cl-badge--default">Sin fecha</span>
  if (value >= 0)
    return (
      <span className="cl-badge cl-badge--overdue">
        {value === 0 ? 'Hoy vence' : `+${value} días`}
      </span>
    )
  const rem = -value
  if (rem <= 60)
    return <span className="cl-badge cl-badge--warning">{rem} días</span>
  return <span className="cl-badge cl-badge--ok">{Math.ceil(rem / 30)} meses</span>
}

function renderCanonCell({ value }) {
  return <span>{fmtCOP(value)}</span>
}

function handleRowPrepared(e) {
  if (e.rowType !== 'data') return
  const s = calcDaysStatus(e.data.rental_start_date)
  if (!s) return
  if (s.overdue) e.rowElement.classList.add('cl-row--overdue')
  else if (!s.ok) e.rowElement.classList.add('cl-row--warning')
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ContractsList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const records = useSelector((s) => s.contrato.summary)
  const loading = useSelector((s) => s.contrato.summaryFetching)

  useEffect(() => {
    dispatch(contractActions.fetchSummaryRequest())
  }, [dispatch])

  const stats = useMemo(() => {
    if (!records) return null
    return records.reduce(
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

  const handleOpenContract = useCallback(
    (id) => navigate(`/contratos/generar?id=${id}`),
    [navigate],
  )

  const nameCellRender = useCallback(
    ({ data }) => (
      <button type="button" className="cl__link" onClick={() => handleOpenContract(data.id)}>
        {data.name}
      </button>
    ),
    [handleOpenContract],
  )

  if (loading && !records) return <Spinner mode="section" />

  return (
    <div className="cl">
      <div className="cl__header">
        <h2 className="cl__header-title">Contratos — Actualización de canon</h2>
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

      {isMobile ? (
        <StandardList
          data={records || []}
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
          renderRows={(d) => [
            [d.tenant_name || <span className={SL.muted}>Sin inquilino</span>],
            [d.property_address || <span className={SL.muted}>Sin inmueble</span>],
            [
              d.rental_start_date
                ? <><span className={SL.label}>Inicio </span>{d.rental_start_date}</>
                : null,
              d.rental_value ? fmtCOP(d.rental_value) : null,
              d.rental_payment_day
                ? <><span className={SL.label}>Paga </span>{`día ${d.rental_payment_day}`}</>
                : null,
            ],
          ]}
          renderActions={(d) => [
            {
              label: '✏️',
              color: 'primary',
              title: 'Abrir en editor',
              onClick: () => handleOpenContract(d.id),
            },
          ]}
        />
      ) : (
        <StandardGrid
          dataSource={records || []}
          keyExpr="id"
          onRowPrepared={handleRowPrepared}
        >
          <FilterRow visible />
          <Paging defaultPageSize={25} />
          <Toolbar>
            <Item name="searchPanel" />
          </Toolbar>

          <Column
            dataField="name"
            caption="Contrato"
            width={200}
            cellRender={nameCellRender}
          />
          <Column
            dataField="tenant_name"
            caption="Inquilino"
            width={180}
          />
          <Column
            dataField="property_address"
            caption="Inmueble"
            minWidth={160}
          />
          <Column
            dataField="rental_start_date"
            caption="Fecha inicio"
            dataType="date"
            width={120}
            alignment="center"
            defaultSortOrder="asc"
          />
          <Column
            dataField="rental_value"
            caption="Canon"
            dataType="number"
            width={120}
            alignment="right"
            cellRender={renderCanonCell}
          />
          <Column
            dataField="rental_payment_day"
            caption="Día de pago"
            dataType="number"
            width={100}
            alignment="center"
            customizeText={({ value }) => fmtPayDay(value)}
          />
          <Column
            caption="Actualizar canon"
            width={150}
            alignment="center"
            calculateCellValue={calcSortValue}
            cellRender={renderDaysCell}
            defaultSortOrder="desc"
            sortIndex={0}
            allowFiltering={false}
          />
        </StandardGrid>
      )}
    </div>
  )
}
