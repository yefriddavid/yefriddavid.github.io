import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'
import { CCollapse } from '@coreui/react'
import { cilCalendar, cilChevronBottom, cilChevronRight } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import * as accountStatusNoteActions from 'src/actions/cashflow/accountStatusNoteActions'
import { push as pushNotification } from 'src/reducers/notificationsSlice'
import { selectCumulativePaymentsMap } from 'src/selectors/cashflowSelectors'
import useLocaleData from 'src/hooks/useLocaleData'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import AttachmentViewer from 'src/components/shared/AttachmentViewer'
import { uploadImage } from 'src/services/facade/imageFacade'
import OcrReceiptImporter from '../OcrReceiptImporter/OcrReceiptImporter'
import { getPendingShare, clearPendingShare } from 'src/services/idb/pendingShare'
import {
  fmt,
  isApplicableToMonth,
  getStatus,
  resolveMaxDatePay,
  CURRENT_YEAR,
  CURRENT_MONTH,
  now,
} from './helpers'
import DetailModal from './DetailModal'
import PayModal from './PayModal'
import AccountCard from './AccountCard'
import AccountCardSkeleton from './AccountCardSkeleton'
import AdHocExpenseModal from './AdHocExpenseModal'
import AdHocSection from './AdHocSection'
import PeriodNotes from './PeriodNotes'
import './AccountStatus.scss'

export { fmt, isApplicableToMonth, getStatus }

export default function AccountStatus() {
  const { monthLabels } = useLocaleData()
  const dispatch = useDispatch()
  const division = useLocation().pathname.startsWith('/inmobiliaria/') ? 'inmobiliaria' : 'personal'
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
  const [attachedDoneId, setAttachedDoneId] = useState(null)
  const [addingAdHoc, setAddingAdHoc] = useState(false)
  const [editingAdHoc, setEditingAdHoc] = useState(null)
  const [sharedFile, setSharedFile] = useState(null)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [periodPickerOpen, setPeriodPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(year)
  const attachRef = useRef()

  const shareToken = searchParams.get('share')
  useEffect(() => {
    if (!shareToken) return
    getPendingShare().then((entry) => {
      if (!entry) return
      clearPendingShare()
      setSearchParams(
        (prev) => {
          prev.delete('share')
          return prev
        },
        { replace: true },
      )
      const file = new File([entry.buffer], entry.name, { type: entry.type })
      setSharedFile(file)
    })
  }, [shareToken])

  const activeTenantId = useActiveTenantId()

  useEffect(() => {
    dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch, activeTenantId])

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const debtAccountIds = useMemo(
    () => (masters ?? []).filter((a) => a.targetAmount > 0).map((a) => a.id),
    [masters],
  )

  useEffect(() => {
    if (!masters) return
    dispatch(transactionActions.fetchRequest({ month: monthStr, debtAccountIds }))
  }, [dispatch, monthStr, activeTenantId, masters, debtAccountIds])

  useEffect(() => {
    dispatch(accountStatusNoteActions.fetchRequest({ period: monthStr }))
  }, [dispatch, monthStr, activeTenantId])

  const cumulativePaymentsMap = useSelector(selectCumulativePaymentsMap)

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

  const applicable = useMemo(() => {
    if (!masters) return []
    return masters.filter((a) => {
      if ((a.division ?? 'personal') !== division) return false
      if (a.type !== typeTab || !a.active) return false
      if (a.targetAmount > 0) {
        // Still owed → show. Fully paid → keep showing only in the month(s) where a
        // payment actually landed, so it doesn't vanish before you can see it as "Pagado".
        if ((cumulativePaymentsMap[a.id] ?? 0) < a.targetAmount) return true
        return (masterPaymentsMap[a.id]?.length ?? 0) > 0
      }
      return isApplicableToMonth(a, month)
    })
  }, [masters, month, typeTab, cumulativePaymentsMap, division, masterPaymentsMap])

  const adHocTransactions = useMemo(() => {
    if (!transactions) return []
    return transactions.filter(
      (t) =>
        !t.accountMasterId &&
        (t.accountMonth ?? t.date?.slice(0, 7)) === monthStr &&
        (t.division ?? 'personal') === division,
    )
  }, [transactions, monthStr, division])

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
        tov += Number(a.defaultValue) || 0
      } else if (s.label === 'Parcial') {
        pe++
        tpe += (Number(a.defaultValue) || 0) - s.paid
      } else {
        pe++
        tpe += Number(a.defaultValue) || 0
      }
    })
    return { paid: p, pending: pe, overdue: ov, totalPending: tpe, totalOverdue: tov }
  }, [applicable, masterPaymentsMap, monthStr, cumulativePaymentsMap])

  const totalPaid = useMemo(
    () =>
      applicable.reduce((sum, a) => {
        const payments = masterPaymentsMap[a.id] ?? []
        return sum + payments.reduce((s, t) => s + (Number(t.amount) || 0), 0)
      }, 0),
    [applicable, masterPaymentsMap],
  )

  const { totalIncome, totalExpenses } = useMemo(() => {
    if (!masters) return { totalIncome: 0, totalExpenses: 0 }
    let income = 0
    let expenses = 0
    masters
      .filter((a) => (a.division ?? 'personal') === division && isApplicableToMonth(a, month))
      .forEach((a) => {
        const payments = masterPaymentsMap[a.id] ?? []
        const paidAmt = payments.reduce((s, t) => s + (Number(t.amount) || 0), 0)
        if (a.type === 'Incoming') {
          income += Math.max(paidAmt, Number(a.defaultValue) || 0)
        } else {
          expenses += Math.max(paidAmt, Number(a.defaultValue) || 0)
        }
      })
    return { totalIncome: income, totalExpenses: expenses }
  }, [masters, month, masterPaymentsMap, division])

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
      .sort(
        (a, b) =>
          resolveMaxDatePay(a.maxDatePay, monthStr) - resolveMaxDatePay(b.maxDatePay, monthStr),
      )
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
    dispatch(transactionActions.createRequest({ ...payload, division }))
    dispatch(pushNotification({ type: 'success', message: 'Pago registrado correctamente.' }))
  }

  const handleSaveAdHoc = (payload) => {
    dispatch(transactionActions.createRequest({ ...payload, division }))
    dispatch(pushNotification({ type: 'success', message: 'Transacción creada correctamente.' }))
  }

  const handleUpdateAdHoc = (payload) => {
    dispatch(transactionActions.updateRequest(payload))
    dispatch(
      pushNotification({ type: 'success', message: 'Transacción actualizada correctamente.' }),
    )
    setEditingAdHoc(null)
  }

  const handleUpdate = (transaction) => {
    dispatch(transactionActions.updateRequest(transaction))
    dispatch(pushNotification({ type: 'success', message: 'Transacción actualizada.' }))
  }

  const handleToggleAdHocPaid = (transaction) => {
    handleUpdate({ id: transaction.id, paid: transaction.paid === false })
  }

  const handleDelete = (transaction) => {
    if (window.confirm(`¿Eliminar este pago de ${fmt(transaction.amount)}?`)) {
      dispatch(transactionActions.deleteRequest({ id: transaction.id }))
    }
  }

  const otherDivision = division === 'inmobiliaria' ? 'personal' : 'inmobiliaria'
  const otherDivisionLabel = otherDivision === 'inmobiliaria' ? 'Inmobiliaria' : 'Personal'

  const handleMoveAccountDivision = (account) => {
    dispatch(accountsMasterActions.updateRequest({ id: account.id, division: otherDivision }))
    ;(transactions ?? [])
      .filter((t) => t.accountMasterId === account.id)
      .forEach((payment) => {
        dispatch(transactionActions.updateRequest({ id: payment.id, division: otherDivision }))
      })
    dispatch(
      pushNotification({ type: 'success', message: `Cuenta movida a ${otherDivisionLabel}.` }),
    )
  }

  const handleMoveTransactionDivision = (transaction) => {
    dispatch(transactionActions.updateRequest({ id: transaction.id, division: otherDivision }))
    dispatch(
      pushNotification({ type: 'success', message: `Transacción movida a ${otherDivisionLabel}.` }),
    )
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
    dispatch(pushNotification({ type: 'success', message: 'Cuenta duplicada correctamente.' }))
    setDetail(null)
  }

  const handleAddNote = (text) => {
    dispatch(accountStatusNoteActions.createRequest({ period: monthStr, text, division }))
    dispatch(pushNotification({ type: 'success', message: 'Nota agregada.' }))
  }

  const handleToggleNote = (note) => {
    dispatch(accountStatusNoteActions.updateRequest({ id: note.id, checked: !note.checked }))
    dispatch(pushNotification({ type: 'success', message: 'Nota actualizada.' }))
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
      const data = await uploadImage(file)
      dispatch(
        transactionActions.updateRequest({
          ...attachingTx,
          attachment: data,
          attachmentName: file.name,
        }),
      )
    } catch (err) {
      alert(err.message)
      setAttachingTx(null)
    } finally {
      setAttachProcessing(false)
    }
  }

  const prevSaving = React.useRef(saving)
  useEffect(() => {
    if (prevSaving.current && !saving) {
      setPaying(null)
      setAddingAdHoc(false)
      if (attachingTx) {
        const doneId = attachingTx.id
        setAttachingTx(null)
        setAttachedDoneId(doneId)
        setTimeout(() => setAttachedDoneId((cur) => (cur === doneId ? null : cur)), 2000)
      }
    }
    prevSaving.current = saving
  }, [saving, attachingTx])

  const loading = fetching || (fetchingMasters && !masters)

  return (
    <div className="account-status-page">
      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div className="as-left-panel">
        {/* Month navigator */}
        <div className="as-month-navigator">
          <button onClick={prevMonth} className="nav-btn">
            ‹
          </button>

          <div className="current-period">
            <button
              type="button"
              className="current-period__toggle"
              aria-label="Seleccionar mes y año"
              onClick={() => {
                setPickerYear(year)
                setPeriodPickerOpen(true)
              }}
            >
              <div className="month-name">{monthLabels[month - 1]}</div>
              <div className="year-name">{year}</div>
              <div className="current-day">
                <CIcon icon={cilCalendar} size="sm" />{' '}
                {now
                  .toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' })
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </div>
            </button>

            {periodPickerOpen && (
              <>
                <div
                  className="as-period-picker-backdrop"
                  onClick={() => setPeriodPickerOpen(false)}
                />
                <div className="as-period-picker" onClick={(e) => e.stopPropagation()}>
                  <div className="as-period-picker__year-row">
                    <button
                      type="button"
                      className="nav-btn nav-btn--sm"
                      onClick={() => setPickerYear((y) => y - 1)}
                    >
                      ‹
                    </button>
                    <input
                      type="number"
                      className="as-period-picker__year"
                      value={pickerYear}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (e.target.value !== '' && !Number.isNaN(v)) setPickerYear(v)
                      }}
                    />
                    <button
                      type="button"
                      className="nav-btn nav-btn--sm"
                      onClick={() => setPickerYear((y) => y + 1)}
                    >
                      ›
                    </button>
                  </div>
                  <div className="as-period-picker__months">
                    {monthLabels.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        className={`as-period-picker__month ${
                          pickerYear === year && i + 1 === month
                            ? 'as-period-picker__month--active'
                            : ''
                        }`}
                        onClick={() => {
                          setSearchParams((prev) => {
                            prev.set('year', pickerYear)
                            prev.set('month', i + 1)
                            return prev
                          })
                          setPeriodPickerOpen(false)
                        }}
                      >
                        {label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={nextMonth} className="nav-btn">
            ›
          </button>
        </div>

        {/* Panel toggle */}
        <div className="as-panel-toggle" onClick={() => setPanelExpanded((v) => !v)}>
          <span className="as-panel-toggle-label">Resumen del período</span>
          <CIcon
            icon={panelExpanded ? cilChevronBottom : cilChevronRight}
            size="sm"
            className="as-panel-toggle-icon"
          />
        </div>

        <CCollapse visible={panelExpanded}>
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
              <div key={s.label} className={`summary-card summary-card--${s.type}`}>
                <div className="summary-value">{s.value}</div>
                <div className="summary-label">{s.label}</div>
                {s.total > 0 && <div className="summary-total">{fmt(s.total)}</div>}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="as-total-strip">
            <span className="total-label">Total:</span>
            <span className="total-value">{fmt(totalPaid + totalPending + totalOverdue)}</span>
          </div>

          {/* Period notes */}
          {!fetching && (
            <PeriodNotes
              period={monthStr}
              notes={periodNotes?.filter((n) => (n.division ?? 'personal') === division)}
              fetching={fetchingNotes}
              saving={savingNotes}
              onAdd={handleAddNote}
              onToggle={handleToggleNote}
              onDelete={handleDeleteNote}
            />
          )}
          {/* OCR importer  */}
          <div style={{ /*display: 'flex',*/ justifyContent: 'flex-end', marginBottom: 8 }}>
            <OcrReceiptImporter
              masters={masters}
              monthStr={monthStr}
              transactions={transactions}
              onConfirm={handleSavePayment}
              initialFile={sharedFile}
            />
          </div>

          {/* Balance strip */}
          {(totalIncome > 0 || totalExpenses > 0) &&
            (() => {
              const balance = totalIncome - totalExpenses
              const isPositive = balance >= 0
              return (
                <div
                  className={`as-balance-strip as-balance-strip--${isPositive ? 'positive' : 'negative'}`}
                >
                  <div className="balance-info">
                    <span className="balance-label">Ingresos − Egresos</span>
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
        </CCollapse>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div className="as-right-panel">
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

        {/* OCR importer
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <OcrReceiptImporter masters={masters} monthStr={monthStr} onConfirm={handleSavePayment} />
        </div>

        */}
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
          <>
            <AccountCardSkeleton />
            <AccountCardSkeleton />
            <AccountCardSkeleton />
            <AccountCardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="as-empty-container">
            {applicable.length === 0
              ? 'No hay cuentas configuradas para este mes.'
              : 'Sin cuentas en este filtro.'}
          </div>
        ) : (
          filtered
            .slice()
            .sort(
              (a, b) =>
                resolveMaxDatePay(a.maxDatePay, monthStr) -
                resolveMaxDatePay(b.maxDatePay, monthStr),
            )
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
                attachingId={attachingTx && (attachProcessing || saving) ? attachingTx.id : null}
                attachedId={attachedDoneId}
                savingId={saving ? paying?.id : null}
                onMoveDivision={handleMoveAccountDivision}
                moveDivisionLabel={otherDivisionLabel}
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
          onTogglePaid={handleToggleAdHocPaid}
          onMoveDivision={handleMoveTransactionDivision}
          moveDivisionLabel={otherDivisionLabel}
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
          payments={masterPaymentsMap[paying.id] ?? []}
          cumulativePaid={cumulativePaymentsMap[paying.id] ?? 0}
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
