import React, { useEffect, useMemo, useRef, useState } from 'react'
import AttachmentViewer from 'src/components/shared/AttachmentViewer'
import { processAttachmentFile } from 'src/utils/fileHelpers'
import { useDispatch, useSelector } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from 'src/constants/cashFlow'
import {
  fmt,
  CURRENT_YEAR,
  CURRENT_MONTH,
  YEARS,
  MONTHS,
  isApplicableToMonth,
} from './helpers'
import SummaryCard from './SummaryCard'
import MigrationModal from './MigrationModal'
import TransactionForm from './TransactionForm'
import MaestroRow from './MaestroRow'
import AnnualView from './AnnualView'
import '../../movements/payments/Payments.scss'
import '../../movements/payments/ItemDetail.scss'

export default function Transactions() {
  const dispatch = useDispatch()
  const { data, fetching, saving } = useSelector((s) => s.transaction)
  const { data: masters, fetching: fetchingMasters } = useSelector((s) => s.accountsMaster)

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formModal, setFormModal] = useState(null)
  const [migrationOpen, setMigrationOpen] = useState(false)
  const [viewer, setViewer] = useState(null)
  const [activeTab, setActiveTab] = useState('maestro')
  const [attachingTx, setAttachingTx] = useState(null)
  const [attachProcessing, setAttachProcessing] = useState(false)
  const attachRef = useRef()

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({ year }))
  }, [dispatch, year])

  useEffect(() => {
    if (!masters) dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch, masters])

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const applicableMasters = useMemo(() => {
    if (!masters) return []
    return masters.filter((acc) => isApplicableToMonth(acc, month))
  }, [masters, month])

  const masterPaymentsMap = useMemo(() => {
    if (!data) return {}
    const map = {}
    data.forEach((t) => {
      if (t.accountMasterId && t.date?.startsWith(monthStr)) {
        if (!map[t.accountMasterId]) map[t.accountMasterId] = []
        map[t.accountMasterId].push(t)
      }
    })
    return map
  }, [data, monthStr])

  const freeTransactions = useMemo(() => {
    if (!data) return []
    return data.filter((r) => {
      if (!r.date?.startsWith(monthStr)) return false
      if (r.accountMasterId) return false
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (categoryFilter && r.category !== categoryFilter) return false
      return true
    })
  }, [data, monthStr, typeFilter, categoryFilter])

  const totalMasterPaid = useMemo(
    () =>
      Object.values(masterPaymentsMap)
        .flat()
        .reduce((s, t) => s + (t.amount || 0), 0),
    [masterPaymentsMap],
  )
  const totalMasterIncoming = useMemo(
    () =>
      applicableMasters
        .filter((a) => a.type === 'Incoming')
        .flatMap((a) => masterPaymentsMap[a.id] ?? [])
        .reduce((s, t) => s + (t.amount || 0), 0),
    [applicableMasters, masterPaymentsMap],
  )
  const totalMasterOutcoming = useMemo(
    () =>
      applicableMasters
        .filter((a) => a.type === 'Outcoming')
        .flatMap((a) => masterPaymentsMap[a.id] ?? [])
        .reduce((s, t) => s + (t.amount || 0), 0),
    [applicableMasters, masterPaymentsMap],
  )
  const totalFreeExpense = useMemo(
    () =>
      freeTransactions.filter((r) => r.type === 'expense').reduce((s, r) => s + (r.amount || 0), 0),
    [freeTransactions],
  )
  const totalFreeIncome = useMemo(
    () =>
      freeTransactions.filter((r) => r.type === 'income').reduce((s, r) => s + (r.amount || 0), 0),
    [freeTransactions],
  )
  const masterPendingCount = useMemo(
    () => applicableMasters.filter((acc) => !masterPaymentsMap[acc.id]?.length).length,
    [applicableMasters, masterPaymentsMap],
  )

  const activeCategories = useMemo(() => {
    if (typeFilter === 'expense') return EXPENSE_CATEGORIES
    if (typeFilter === 'income') return INCOME_CATEGORIES
    return [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])]
  }, [typeFilter])

  const handleCreate = (payload) => {
    dispatch(transactionActions.createRequest(payload))
    setFormModal(null)
  }

  const handleUpdate = (payload) => {
    dispatch(transactionActions.updateRequest(payload))
    setFormModal(null)
  }

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.description || row.category || 'esta transacción'}"?`)) {
      dispatch(transactionActions.deleteRequest({ id: row.id }))
    }
  }

  const handlePayMaster = (account) => {
    const defaultDate = (() => {
      const d = new Date(year, month - 1, account.maxDatePay || 15)
      return d.toISOString().slice(0, 10)
    })()
    setFormModal({
      mode: 'create',
      initial: {
        type: account.type === 'Outcoming' ? 'expense' : 'income',
        category: account.category || '',
        description: account.name,
        amount: account.defaultValue || '',
        date: defaultDate,
        accountMasterId: account.id,
        accountMasterName: account.name,
        accountMasterImportant: account.important,
      },
    })
  }

  const handleViewPayment = (transaction) => {
    setFormModal({ mode: 'edit', initial: transaction })
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
      const fileData = await processAttachmentFile(file)
      dispatch(
        transactionActions.updateRequest({
          ...attachingTx,
          attachment: fileData,
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

  return (
    <>
      <CCard className="mb-3">
        <CCardHeader
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <strong>Transacciones</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              onClick={() => setMigrationOpen(true)}
            >
              ↓ Migrar legado
            </CButton>
            <CButton size="sm" color="primary" onClick={() => setFormModal({ mode: 'create' })}>
              + Nueva transacción
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <SummaryCard
              label="Cuentas maestras pagadas"
              value={fmt(totalMasterPaid)}
              color="#1e3a5f"
              bg="#eef4ff"
              sub={`${applicableMasters.length - masterPendingCount} de ${applicableMasters.length} pagadas`}
            />
            <SummaryCard
              label="Pendientes del maestro"
              value={masterPendingCount}
              color={masterPendingCount > 0 ? '#f59f00' : '#2f9e44'}
              bg={masterPendingCount > 0 ? '#fff9db' : '#f0fdf4'}
              sub={masterPendingCount > 0 ? 'cuentas sin registrar' : 'Todo al día'}
            />
            <SummaryCard
              label="Otros ingresos"
              value={fmt(totalFreeIncome)}
              color="#2f9e44"
              bg="#f0fdf4"
            />
            <SummaryCard
              label="Otros gastos"
              value={fmt(totalFreeExpense)}
              color="#e03131"
              bg="#fff5f5"
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{
                fontSize: 13,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--cui-secondary)',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{
                fontSize: 13,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--cui-secondary)',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              style={{ marginLeft: 'auto' }}
              onClick={() => dispatch(transactionActions.fetchRequest({ year }))}
            >
              ↺ Actualizar
            </CButton>
          </div>

          <div
            style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #e9ecef' }}
          >
            {[
              { key: 'maestro', label: `Maestro del mes (${applicableMasters.length})` },
              { key: 'transactions', label: 'Otras transacciones' },
              { key: 'anual', label: `Anual ${year}` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: activeTab === tab.key ? 700 : 400,
                  color: activeTab === tab.key ? '#1e3a5f' : '#6c757d',
                  borderBottom:
                    activeTab === tab.key ? '2px solid #1e3a5f' : '2px solid transparent',
                  marginBottom: -2,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'maestro' && (
            <>
              {fetchingMasters && !masters ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <CSpinner color="primary" />
                </div>
              ) : applicableMasters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#6c757d', fontSize: 13 }}>
                  No hay cuentas maestras configuradas para este mes.{' '}
                  <a href="/cash_flow/management/accounts-master" style={{ color: '#1e3a5f' }}>
                    Configurar maestro →
                  </a>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e9ecef', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#1e3a5f' }}>
                        {[
                          'Nombre',
                          'Categoría',
                          'Clasificación',
                          'Día máx.',
                          'Método pago',
                          'Monto pagado',
                          'Estado',
                          'Acción',
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '9px 12px',
                              color: '#fff',
                              textAlign: 'left',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {applicableMasters.map((account) => (
                        <MaestroRow
                          key={account.id}
                          account={account}
                          payments={masterPaymentsMap[account.id] ?? []}
                          monthStr={monthStr}
                          onPay={handlePayMaster}
                          onViewPayment={handleViewPayment}
                          onViewAttachment={(src, filename) => setViewer({ src, filename })}
                          onDelete={handleDelete}
                          onAttach={handleAttach}
                          attachingId={attachProcessing ? attachingTx?.id : null}
                        />
                      ))}
                    </tbody>
                    <tfoot>
                      {totalMasterIncoming > 0 && (
                        <tr style={{ background: '#ebfbee', fontWeight: 600 }}>
                          <td
                            colSpan={5}
                            style={{ padding: '7px 12px', fontSize: 12, color: '#2f9e44' }}
                          >
                            + Total Ingresos
                          </td>
                          <td
                            style={{
                              padding: '7px 12px',
                              fontSize: 13,
                              textAlign: 'right',
                              color: '#2f9e44',
                            }}
                          >
                            {fmt(totalMasterIncoming)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      )}
                      {totalMasterOutcoming > 0 && (
                        <tr style={{ background: '#fff5f5', fontWeight: 600 }}>
                          <td
                            colSpan={5}
                            style={{ padding: '7px 12px', fontSize: 12, color: '#c0392b' }}
                          >
                            − Total Egresos
                          </td>
                          <td
                            style={{
                              padding: '7px 12px',
                              fontSize: 13,
                              textAlign: 'right',
                              color: '#c0392b',
                            }}
                          >
                            {fmt(totalMasterOutcoming)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      )}
                      <tr
                        style={{
                          background: '#1e3a5f',
                          fontWeight: 700,
                          borderTop: '2px solid #fff',
                        }}
                      >
                        <td
                          colSpan={5}
                          style={{ padding: '8px 12px', fontSize: 12, color: '#fff' }}
                        >
                          Balance
                        </td>
                        <td
                          style={{
                            padding: '8px 12px',
                            fontSize: 13,
                            textAlign: 'right',
                            fontWeight: 700,
                            color:
                              totalMasterIncoming - totalMasterOutcoming >= 0
                                ? '#69db7c'
                                : '#ff8787',
                          }}
                        >
                          {fmt(totalMasterIncoming - totalMasterOutcoming)}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'transactions' && (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value)
                    setCategoryFilter('')
                  }}
                  style={{
                    fontSize: 13,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${typeFilter !== 'all' ? '#1e3a5f' : 'var(--cui-secondary)'}`,
                    background: typeFilter !== 'all' ? '#eef4ff' : '#fff',
                    color: typeFilter !== 'all' ? '#1e3a5f' : undefined,
                    fontWeight: typeFilter !== 'all' ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">Tipo: Todos</option>
                  <option value="income">Ingresos</option>
                  <option value="expense">Gastos</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    fontSize: 13,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${categoryFilter ? '#1e3a5f' : 'var(--cui-secondary)'}`,
                    background: categoryFilter ? '#eef4ff' : '#fff',
                    color: categoryFilter ? '#1e3a5f' : undefined,
                    fontWeight: categoryFilter ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Categoría: Todas</option>
                  {activeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {(typeFilter !== 'all' || categoryFilter) && (
                  <button
                    onClick={() => {
                      setTypeFilter('all')
                      setCategoryFilter('')
                    }}
                    style={{
                      fontSize: 11,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #e03131',
                      background: 'none',
                      color: '#e03131',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Limpiar
                  </button>
                )}
              </div>

              {fetching && !data ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <CSpinner color="primary" />
                </div>
              ) : (
                <StandardGrid
                  keyExpr="id"
                  dataSource={freeTransactions}
                  noDataText="Sin transacciones libres para este periodo"
                >
                  <Column
                    dataField="date"
                    caption="Fecha"
                    width={110}
                    dataType="date"
                    format="dd/MM/yyyy"
                    sortOrder="desc"
                  />
                  <Column
                    dataField="type"
                    caption="Tipo"
                    width={100}
                    cellRender={({ value }) => (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          padding: '2px 8px',
                          background: value === 'income' ? '#f0fdf4' : '#fff5f5',
                          color: value === 'income' ? '#2f9e44' : '#e03131',
                          border: `1px solid ${value === 'income' ? '#86efac' : '#fca5a5'}`,
                        }}
                      >
                        {value === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    )}
                  />
                  <Column dataField="category" caption="Categoría" width={150} />
                  <Column dataField="description" caption="Descripción" minWidth={180} />
                  <Column
                    dataField="amount"
                    caption="Monto"
                    width={140}
                    alignment="right"
                    cellRender={({ data: row }) => (
                      <span
                        style={{
                          fontWeight: 700,
                          color: row.type === 'income' ? '#2f9e44' : '#e03131',
                        }}
                      >
                        {row.type === 'income' ? '+' : '-'}
                        {fmt(row.amount)}
                      </span>
                    )}
                  />
                  <Column
                    caption="📎"
                    width={46}
                    alignment="center"
                    allowSorting={false}
                    cellRender={({ data: row }) =>
                      row.attachment ? (
                        <button
                          title="Ver adjunto"
                          onClick={() =>
                            setViewer({
                              src: row.attachment,
                              filename: row.attachmentName || 'adjunto.jpg',
                            })
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 16,
                            padding: '2px 4px',
                          }}
                        >
                          📎
                        </button>
                      ) : (
                        <button
                          title="Adjuntar"
                          onClick={() => handleAttach(row)}
                          disabled={attachProcessing && attachingTx?.id === row.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px 4px',
                            cursor:
                              attachProcessing && attachingTx?.id === row.id
                                ? 'not-allowed'
                                : 'pointer',
                            fontSize: 13,
                            color: '#adb5bd',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {attachProcessing && attachingTx?.id === row.id ? (
                            <CSpinner size="sm" style={{ width: 10, height: 10 }} />
                          ) : (
                            '📎'
                          )}
                        </button>
                      )
                    }
                  />
                  <Column
                    caption=""
                    width={80}
                    alignment="center"
                    allowSorting={false}
                    cellRender={({ data: row }) => (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          title="Editar"
                          onClick={() => setFormModal({ mode: 'edit', initial: row })}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#1e3a5f',
                            fontSize: 15,
                            padding: '2px 4px',
                          }}
                        >
                          ✎
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => handleDelete(row)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e03131',
                            fontSize: 15,
                            padding: '2px 4px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  />
                  <Summary>
                    <TotalItem
                      column="amount"
                      summaryType="sum"
                      customizeText={() =>
                        fmt(
                          freeTransactions
                            .filter((r) => r.type === 'income')
                            .reduce((s, r) => s + (r.amount || 0), 0) -
                            freeTransactions
                              .filter((r) => r.type === 'expense')
                              .reduce((s, r) => s + (r.amount || 0), 0),
                        )
                      }
                      displayFormat="Balance: {0}"
                    />
                  </Summary>
                </StandardGrid>
              )}
            </>
          )}

          {activeTab === 'anual' && (
            <>
              {fetchingMasters && !masters ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <CSpinner color="primary" />
                </div>
              ) : (
                <AnnualView masters={masters} transactions={data} year={year} />
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {migrationOpen && (
        <MigrationModal
          onClose={() => setMigrationOpen(false)}
          onDone={() => {
            setMigrationOpen(false)
            dispatch(transactionActions.fetchRequest({ year }))
          }}
        />
      )}

      <input
        ref={attachRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleAttachFile}
      />

      {viewer && (
        <AttachmentViewer
          src={viewer.src}
          filename={viewer.filename}
          onClose={() => setViewer(null)}
        />
      )}

      <CModal visible={!!formModal} onClose={() => setFormModal(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>
            {formModal?.mode === 'edit' ? 'Editar transacción' : 'Nueva transacción'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 0 }}>
          {formModal && (
            <TransactionForm
              initial={formModal.initial}
              saving={saving}
              onSave={
                formModal.mode === 'edit'
                  ? (p) => handleUpdate({ ...formModal.initial, ...p })
                  : handleCreate
              }
              onCancel={() => setFormModal(null)}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}
