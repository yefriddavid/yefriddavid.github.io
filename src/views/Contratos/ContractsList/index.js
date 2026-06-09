import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import Spinner from 'src/components/shared/Spinner'
import * as contractActions from 'src/actions/contratos/contractActions'
import * as moduleNoteActions from 'src/actions/contratos/contractModuleNoteActions'
import ModuleNotes from './ModuleNotes'
import CanonHistoryPanel from '../CanonHistoryPanel'
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
  return v ? `$${String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : null
}

function fmtDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ContractsList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const records = useSelector((s) => s.contrato.summary)
  const loading = useSelector((s) => s.contrato.summaryFetching)
  const notes = useSelector((s) => s.contratoModuleNote.notes)
  const notesFetching = useSelector((s) => s.contratoModuleNote.fetching)
  const notesSaving = useSelector((s) => s.contratoModuleNote.saving)
  const [showArchived, setShowArchived] = useState(false)
  const [historyModal, setHistoryModal] = useState(null)

  useEffect(() => {
    dispatch(contractActions.fetchSummaryRequest())
    dispatch(moduleNoteActions.fetchRequest())
  }, [dispatch])

  // Re-fetch when the tab/window regains focus so data stays fresh after
  // editing a contract in GenerarContrato and navigating back here
  useEffect(() => {
    const onFocus = () => dispatch(contractActions.fetchSummaryRequest())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
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

  const handleNoteAdd = useCallback(
    (text) => dispatch(moduleNoteActions.createRequest({ text })),
    [dispatch],
  )
  const handleNoteUpdate = useCallback(
    (id, text) => dispatch(moduleNoteActions.updateRequest({ id, text })),
    [dispatch],
  )
  const handleNoteDelete = useCallback(
    (id) => dispatch(moduleNoteActions.deleteRequest({ id })),
    [dispatch],
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
        renderRows={(d) => {
          const s = calcDaysStatus(d.rental_start_date)
          const renewalText = s
            ? s.overdue
              ? `Atrasado +${s.past === 0 ? 'hoy' : `${s.past} días`}`
              : !s.ok
              ? `Por vencer: ${s.remaining} días`
              : `Vence en ${Math.ceil(s.remaining / 30)} meses`
            : null
          return [
            [
              d.tenant_name || <span className={SL.muted}>Sin inquilino</span>,
              fmtCOP(d.rental_value),
            ],
            [d.property_address || <span className={SL.muted}>Sin inmueble</span>],
            [
              d.rental_start_date
                ? <><span className={SL.label}>Inicio </span>{fmtDate(d.rental_start_date)}</>
                : null,
              d.rental_payment_day
                ? <><span className={SL.label}>Paga el </span><span className={SL.mono}>{`día ${d.rental_payment_day}`}</span></>
                : null,
            ],
            renewalText
              ? [
                  <>
                    <span className={SL.label}>Canon: </span>
                    <span
                      className={
                        s.overdue
                          ? 'cl-renewal--overdue'
                          : !s.ok
                          ? 'cl-renewal--warning'
                          : 'cl-renewal--ok'
                      }
                    >
                      {renewalText}
                    </span>
                  </>,
                ]
              : [],
          ]
        }}
        renderActions={(d) => [
          {
            label: '📈',
            color: 'primary',
            title: 'Historial de canon',
            onClick: () =>
              setHistoryModal({
                id: d.id,
                name: d.name,
                history: d.canon_history ?? [],
                baseValue: d.rental_value ?? 0,
              }),
          },
          { label: '✏️', color: 'primary', title: 'Abrir en editor', onClick: () => handleOpen(d.id) },
        ]}
      />

      <ModuleNotes
        notes={notes}
        fetching={notesFetching}
        saving={notesSaving}
        onAdd={handleNoteAdd}
        onUpdate={handleNoteUpdate}
        onDelete={handleNoteDelete}
      />

      {historyModal && (
        <div className="cl-history-overlay" onClick={() => setHistoryModal(null)}>
          <div className="cl-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cl-history-modal__header">
              <div>
                <div className="cl-history-modal__title">Historial de canon</div>
                <div className="cl-history-modal__subtitle">{historyModal.name}</div>
              </div>
              <button
                type="button"
                className="cl-history-modal__close"
                onClick={() => setHistoryModal(null)}
              >×</button>
            </div>
            <div className="cl-history-modal__body">
              <CanonHistoryPanel
                history={historyModal.history}
                baseValue={historyModal.baseValue}
                saving={loading}
                onSave={(history) => {
                  dispatch(
                    contractActions.updateCanonHistoryRequest({ id: historyModal.id, history }),
                  )
                  setHistoryModal((m) => (m ? { ...m, history } : null))
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
