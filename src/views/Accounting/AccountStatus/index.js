import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { cilCalendar } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import * as accountStatusNoteActions from 'src/actions/cashflow/accountStatusNoteActions'
import useLocaleData from 'src/hooks/useLocaleData'
import AttachmentViewer from 'src/components/shared/AttachmentViewer'
import { processAttachmentFile } from 'src/utils/fileHelpers'
import OcrReceiptImporter from '../OcrReceiptImporter'
import { fmt, isApplicableToMonth, getStatus, CURRENT_YEAR, CURRENT_MONTH, now } from './helpers'
import DetailModal from './DetailModal'
import PayModal from './PayModal'
import AccountCard from './AccountCard'
import AdHocExpenseModal from './AdHocExpenseModal'
import AdHocSection from './AdHocSection'
import PeriodNotes from './PeriodNotes'
import './AccountStatus.scss'

export { fmt, isApplicableToMonth, getStatus }

export default function AccountStatus() {
  const { monthLabels } = useLocaleData()
  const dispatch = useDispatch()
  const { data: transactions, fetching, saving } = useSelector((s) => s.transaction)
  const {
    data: masters,
    fetching: fetchingMasters,
    saving: savingMasters,
  } = useSelector((s) => s.accountsMaster)
  const {
    notes: periodNotes,
    fetching: fetchingNotes,
    saving: savingNotes,
  } = useSelector((s) => s.accountStatusNote)

  const [searchParams, setSearchParams] = useSearchParams()
  const typeTab = searchParams.get('tab') === 'Incoming' ? 'Incoming' : 'Outcoming'
  const setTypeTab = (value) =>
    setSearchParams((prev) => {
      prev.set('tab', value)
      return prev
    })

  const year = Number(searchParams.get('year')) || CURRENT_YEAR
  const month = Number(searchParams.get('month')) || CURRENT_MONTH
  const setMonth = (value) =>
    setSearchParams((prev) => {
      prev.set('month', value)
      return prev
    })
  const [filter, setFilter] = useState('all')
  const [paying, setPaying] = useState(null)
  const [detail, setDetail] = useState(null)
  const [viewer, setViewer] = useState(null)
  const [attachingTx, setAttachingTx] = useState(null)
  const [attachProcessing, setAttachProcessing] = useState(false)
  const [addingAdHoc, setAddingAdHoc] = useState(false)
  const [editingAdHoc, setEditingAdHoc] = useState(null)
  const attachRef = useRef()

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({ year }))
  }, [dispatch, year])

  const tenantId = useSelector((s) => s.profile.data?.tenantId)
  useEffect(() => {
    if (!masters || masters.length === 0) {
      dispatch(accountsMasterActions.fetchRequest())
    }
  }, [dispatch, tenantId, masters])

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  useEffect(() => {
    dispatch(accountStatusNoteActions.fetchRequest({ period: monthStr }))
  }, [dispatch, monthStr])

  const cumulativePaymentsMap = useMemo(() => {
    if (!transactions) return {}
    const map = {}
    transactions.forEach((t) => {
      if (!t.accountMasterId) return
      map[t.accountMasterId] = (map[t.accountMasterId] ?? 0) + (t.amount || 0)
    })
    return map
  }, [transactions])

  const applicable = useMemo(() => {
    if (!masters) return []
    return masters.filter((a) => {
      if (a.type !== typeTab || !a.active) return false
      if (a.targetAmount > 0) {
        return (cumulativePaymentsMap[a.id] ?? 0) < a.targetAmount
      }
      return isApplicableToMonth(a, month)
    })
  }, [masters, month, typeTab, cumulativePaymentsMap])

  const masterPaymentsMap = useMemo(() => {
    if (!transactions) return {}
    const map = {}
    transactions.forEach((t) => {
      const period = t.accountMonth ?? t.date?.slice(0, 7)
      if (t.accountMasterId && period === monthStr) {
        if (!map[t.accountMasterId]) map[t.accountMasterId] = []
        map[t.accountMasterId].push(t)
      }
    })
    return map
  }, [transactions, monthStr])

  const adHocTransactions = useMemo(() => {
    if (!transactions) return []
    return transactions.filter(
      (t) => !t.accountMasterId && (t.accountMonth ?? t.date?.slice(0, 7)) === monthStr,
    )
  }, [transactions, monthStr])

  const { paid, pending, overdue, totalPending, totalOverdue } = useMemo(() => {
    let p = 0,
      pe = 0,
      ov = 0,
      tpe = 0,
      tov = 0
    applicable.forEach((a) => {
      const s = getStatus(
        a,
        masterPaymentsMap[a.id] ?? [],
        monthStr,
        a.targetAmount > 0 ? (cumulativePaymentsMap[a.id] ?? 0) : null,
      )
      if (s.label === 'Pagado') p++
      else if (s.label === 'Vencido') {
        ov++
        tov += a.defaultValue || 0
      } else if (s.label === 'Parcial') {
        pe++
        tpe += (a.defaultValue || 0) - s.paid
      } else {
        pe++
        tpe += a.defaultValue || 0
      }
    })
    return { paid: p, pending: pe, overdue: ov, totalPending: tpe, totalOverdue: tov }
  }, [applicable, masterPaymentsMap, monthStr, cumulativePaymentsMap])

  const totalPaid = useMemo(
    () =>
      applicable.reduce((sum, a) => {
        const payments = masterPaymentsMap[a.id] ?? []
        return sum + payments.reduce((s, t) => s + (t.amount || 0), 0)
      }, 0),
    [applicable, masterPaymentsMap],
  )

  const { totalIncome, totalExpenses } = useMemo(() => {
    if (!masters) return { totalIncome: 0, totalExpenses: 0 }
    let income = 0
    let expenses = 0
    masters
      .filter((a) => isApplicableToMonth(a, month))
      .forEach((a) => {
        const payments = masterPaymentsMap[a.id] ?? []
        const paidAmt = payments.reduce((s, t) => s + (t.amount || 0), 0)
        if (a.type === 'Incoming') {
          income += Math.max(paidAmt, a.defaultValue || 0)
        } else {
          expenses += Math.max(paidAmt, a.defaultValue || 0)
        }
      })
    return { totalIncome: income, totalExpenses: expenses }
  }, [masters, month, masterPaymentsMap])

  const filtered = useMemo(() => {
    return applicable
      .filter((a) => {
        if (filter === 'all') return true
        const s = getStatus(
          a,
          masterPaymentsMap[a.id] ?? [],
          monthStr,
          a.targetAmount > 0 ? (cumulativePaymentsMap[a.id] ?? 0) : null,
        )
        if (filter === 'paid') return s.label === 'Pagado'
        if (filter === 'pending')
          return s.label === 'Pendiente' || s.label === 'Vencido' || s.label === 'Parcial'
        return true
      })
      .sort((a, b) => (a.maxDatePay || 31) - (b.maxDatePay || 31))
  }, [applicable, masterPaymentsMap, monthStr, filter])

  const prevMonth = () => {
    if (month === 1) {
      setSearchParams((prev) => {
        prev.set('month', 12)
        prev.set('year', year - 1)
        return prev
      })
    } else {
      setMonth(month - 1)
    }
  }
  const nextMonth = () => {
    if (month === 12) {
      setSearchParams((prev) => {
        prev.set('month', 1)
        prev.set('year', year + 1)
        return prev
      })
    } else {
      setMonth(month + 1)
    }
  }

  const handleSavePayment = (payload) => {
    dispatch(transactionActions.createRequest(payload))
  }

  const handleSaveAdHoc = (payload) => {
    dispatch(transactionActions.createRequest(payload))
  }

  const handleUpdateAdHoc = (payload) => {
    dispatch(transactionActions.updateRequest(payload))
    setEditingAdHoc(null)
  }

  const handleUpdate = (transaction) => {
    dispatch(transactionActions.updateRequest(transaction))
  }

  const handleDelete = (transaction) => {
    if (window.confirm(`¿Eliminar este pago de ${fmt(transaction.amount)}?`)) {
      dispatch(transactionActions.deleteRequest({ id: transaction.id }))
    }
  }

  const handleClone = (account) => {
    const { id: _id, ...fields } = account
    dispatch(
      accountsMasterActions.createRequest({
        ...fields,
        name: `${account.name} (Copia)`,
        active: false,
      }),
    )
    setDetail(null)
  }

  const handleAddNote = (text) => {
    dispatch(accountStatusNoteActions.createRequest({ period: monthStr, text }))
  }

  const handleToggleNote = (note) => {
    dispatch(accountStatusNoteActions.updateRequest({ id: note.id, checked: !note.checked }))
  }

  const handleDeleteNote = (note) => {
    dispatch(accountStatusNoteActions.deleteRequest({ id: note.id }))
  }

  const handleAttach = (transaction) => {
    setAttachingTx(transaction)
    attachRef.current.value = ''
    attachRef.current.click()
  }

  const handleAttachFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !attachingTx) return
    setAttachProcessing(true)
    try {
      const data = await processAttachmentFile(file)
      dispatch(
        transactionActions.updateRequest({
          ...attachingTx,
          attachment: data,
          attachmentName: file.name,
        }),
      )
    } catch (err) {
      alert(err.message)
    } finally {
      setAttachProcessing(false)
      setAttachingTx(null)
    }
  }

  const prevSaving = React.useRef(saving)
  useEffect(() => {
    if (prevSaving.current && !saving) {
      setPaying(null)
      setAddingAdHoc(false)
    }
    prevSaving.current = saving
  }, [saving])

  const loading = (fetching && !transactions) || (fetchingMasters && !masters)

  return (
    <div className="account-status-page">
      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div className="as-left-panel">
        {/* Month navigator */}
        <div className="as-month-navigator">
          <button onClick={prevMonth} className="nav-btn">‹</button>

          <div className="current-period">
            <div className="month-name">
              {monthLabels[month - 1]}
            </div>
            <div className="year-name">{year}</div>
            <div className="current-day">
              <CIcon icon={cilCalendar} size="sm" />{' '}
              {now
                .toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' })
                .replace(/^\w/, (c) => c.toUpperCase())}
            </div>
          </div>

          <button onClick={nextMonth} className="nav-btn">›</button>
        </div>

        {/* Summary strip */}
        <div className="as-summary-strip">
          {[
            {
              label: 'Pagadas',
              value: paid,
              total: totalPaid,
              type: 'paid',
            },
            {
              label: 'Pendientes',
              value: pending,
              total: totalPending,
              type: 'pending',
            },
            {
              label: 'Vencidas',
              value: overdue,
              total: totalOverdue,
              type: 'overdue',
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`summary-card summary-card--${s.type}`}
            >
              <div className="summary-value">
                {s.value}
              </div>
              <div className="summary-label">
                {s.label}
              </div>
              {s.total > 0 && (
                <div className="summary-total">
                  {fmt(s.total)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="as-total-strip">
          <span className="total-label">Total:</span>
          <span className="total-value">
            {fmt(totalPaid + totalPending + totalOverdue)}
          </span>
        </div>

        {/* Period notes */}
        {!fetching && (
          <PeriodNotes
            period={monthStr}
            notes={periodNotes}
            fetching={fetchingNotes}
            saving={savingNotes}
            onAdd={handleAddNote}
            onToggle={handleToggleNote}
            onDelete={handleDeleteNote}
          />
        )}
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div className="as-right-panel">
        {/* Balance strip */}
        {(totalIncome > 0 || totalExpenses > 0) &&
          (() => {
            const balance = totalIncome - totalExpenses
            const isPositive = balance >= 0
            return (
              <div className={`as-balance-strip as-balance-strip--${isPositive ? 'positive' : 'negative'}`}>
                <div className="balance-info">
                  <span className="balance-label">
                    Ingresos − Egresos
                  </span>
                  <span className="balance-formula">
                    {fmt(totalIncome)} − {fmt(totalExpenses)}
                  </span>
                </div>
                <span className="balance-value">
                  {isPositive ? '+' : ''}
                  {fmt(balance)}
                </span>
              </div>
            )
          })()}

        {/* Type tabs */}
        <div className="as-type-tabs">
          {[
            { key: 'Outcoming', label: 'Egresos' },
            { key: 'Incoming', label: 'Ingresos' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTypeTab(t.key)
                setFilter('all')
              }}
              className={`tab-btn ${typeTab === t.key ? 'tab-btn--active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OCR importer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <OcrReceiptImporter masters={masters} monthStr={monthStr} onConfirm={handleSavePayment} />
        </div>

        {/* Filter tabs */}
        <div className="as-filter-tabs">
          {[
            { key: 'all', label: `Todas (${applicable.length})` },
            { key: 'pending', label: `Sin pagar (${pending + overdue})` },
            { key: 'paid', label: `Pagadas (${paid})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`filter-btn ${filter === tab.key ? 'filter-btn--active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="as-loading-container">
            <CSpinner color="primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="as-empty-container">
            {applicable.length === 0
              ? 'No hay cuentas configuradas para este mes.'
              : 'Sin cuentas en este filtro.'}
          </div>
        ) : (
          filtered
            .slice()
            .sort((a, b) => (a.maxDatePay || 31) - (b.maxDatePay || 31))
            .map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                payments={masterPaymentsMap[account.id] ?? []}
                monthStr={monthStr}
                cumulativePaid={cumulativePaymentsMap[account.id] ?? 0}
                onPay={setPaying}
                onDetail={setDetail}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onViewAttachment={(src, filename) => setViewer({ src, filename })}
                onAttach={handleAttach}
                attachingId={attachProcessing ? attachingTx?.id : null}
                savingId={saving ? paying?.id : null}
              />
            ))
        )}

        {/* Ad-hoc period transactions */}
        <AdHocSection
          adHocTransactions={adHocTransactions}
          typeTab={typeTab}
          onAdd={() => setAddingAdHoc(true)}
          onEdit={setEditingAdHoc}
          onDelete={handleDelete}
          onViewAttachment={(src, filename) => setViewer({ src, filename })}
        />
      </div>

      {/* Hidden input for attaching to existing transactions */}
      <input
        ref={attachRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleAttachFile}
      />

      {/* Detail modal */}
      {detail && (
        <DetailModal
          account={detail}
          saving={savingMasters}
          onUpdate={(updated) => {
            dispatch(accountsMasterActions.updateRequest(updated))
            setDetail(null)
          }}
          onClone={handleClone}
          onClose={() => setDetail(null)}
        />
      )}

      {/* Pay modal */}
      {paying && (
        <PayModal
          account={paying}
          year={year}
          month={month}
          saving={saving}
          onSave={handleSavePayment}
          onClose={() => setPaying(null)}
        />
      )}

      {/* Ad-hoc expense modal — create */}
      {addingAdHoc && (
        <AdHocExpenseModal
          year={year}
          month={month}
          defaultType={typeTab}
          saving={saving}
          onSave={handleSaveAdHoc}
          onClose={() => setAddingAdHoc(false)}
        />
      )}

      {/* Ad-hoc expense modal — edit */}
      {editingAdHoc && (
        <AdHocExpenseModal
          year={year}
          month={month}
          defaultType={typeTab}
          saving={saving}
          initialData={editingAdHoc}
          onSave={handleUpdateAdHoc}
          onClose={() => setEditingAdHoc(null)}
        />
      )}

      {/* Attachment viewer */}
      {viewer && (
        <AttachmentViewer
          src={viewer.src}
          filename={viewer.filename}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  )
}
