import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import { CButton, CCard, CCardBody, CCardHeader, CCollapse } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import {
  ACCOUNT_MASTER_TYPES,
  ACCOUNT_MASTER_TYPE_LABELS,
  ACCOUNT_MASTER_NATURE,
  ACCOUNT_NATURE_COLOR as NATURE_COLOR,
  ACCOUNT_TYPE_COLOR as TYPE_COLOR,
} from 'src/constants/accounting'
import { SEED_ACCOUNTS, PATCH_ACCOUNTING } from 'src/constants/accountsMasterSeed'
import AccountMasterForm from './AccountMasterForm'
import { push as pushNotification } from 'src/reducers/notificationsSlice'
import useIsMobile from 'src/hooks/useIsMobile'
import '../../movements/payments/Payments.scss'
import '../../movements/payments/ItemDetail.scss'
import Spinner from 'src/components/shared/Spinner'
import StatusBadge from 'src/components/shared/StatusBadge'

export default function AccountsMaster() {
  const dispatch = useDispatch()
  const { data, fetching, saving, seeding, seedProgress, patching, patchProgress } = useSelector(
    (s) => s.accountsMaster,
  )
  const gridRef = useRef(null)
  const isMobile = useIsMobile()
  const [showForm, setShowForm] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('active')
  const [nameSearch, setNameSearch] = useState('')

  useEffect(() => {
    dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch])

  const filtered = (data ?? []).filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (activeFilter === 'active' && !r.active) return false
    if (activeFilter === 'inactive' && r.active !== false) return false
    if (nameSearch && !r.name?.toLowerCase().includes(nameSearch.toLowerCase())) return false
    return true
  })

  const toggleRow = (row) => {
    if (!gridRef.current) return
    setShowForm(false)
    const instance = gridRef.current.instance
    if (instance.isRowExpanded(row.id)) {
      instance.collapseRow(row.id)
    } else {
      instance.collapseAll(-1)
      instance.expandRow(row.id)
    }
  }

  const handleCreate = (payload) => {
    dispatch(accountsMasterActions.createRequest(payload))
    dispatch(pushNotification({ type: 'success', message: 'Cuenta creada correctamente.' }))
    setShowForm(false)
  }

  const handleUpdate = (payload) => {
    dispatch(accountsMasterActions.updateRequest(payload))
    dispatch(pushNotification({ type: 'success', message: 'Cuenta actualizada correctamente.' }))
    gridRef.current?.instance.collapseAll(-1)
  }

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.name}"?`)) {
      dispatch(accountsMasterActions.deleteRequest({ id: row.id }))
    }
  }

  const handleSeed = () => {
    if (
      !window.confirm(
        `¿Cargar ${SEED_ACCOUNTS.length} cuentas de ejemplo? Esto agregará los registros a la colección actual.`,
      )
    )
      return
    dispatch(accountsMasterActions.seedRequest(SEED_ACCOUNTS))
  }

  const handlePatchAccounting = () => {
    const patches = PATCH_ACCOUNTING.flatMap((p) => {
      const matches = (data ?? []).filter((r) => r.name === p.name)
      return matches.map((r) => ({ id: r.id, code: p.code, accountingName: p.accountingName }))
    })
    if (patches.length === 0) {
      alert('No se encontraron cuentas para actualizar.')
      return
    }
    if (
      !window.confirm(
        `¿Actualizar ${patches.length} cuentas con código PUC y nombre contable NIIF?`,
      )
    )
      return
    dispatch(accountsMasterActions.patchManyRequest(patches))
  }

  const needsPatch = (data ?? []).some((r) => !r.accountingName)

  return (
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
        <strong>Maestro de Cuentas</strong>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {data !== null && data.length === 0 && !seeding && (
            <CButton size="sm" color="warning" variant="outline" onClick={handleSeed}>
              ↓ Cargar datos de ejemplo ({SEED_ACCOUNTS.length})
            </CButton>
          )}
          {seeding && (
            <span
              style={{
                fontSize: 12,
                color: '#6c757d',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Spinner size="sm" /> Cargando… {seedProgress}%
            </span>
          )}
          {needsPatch && !patching && data !== null && data.length > 0 && (
            <CButton size="sm" color="info" variant="outline" onClick={handlePatchAccounting}>
              ✦ Actualizar nombres contables
            </CButton>
          )}
          {patching && (
            <span
              style={{
                fontSize: 12,
                color: '#6c757d',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Spinner size="sm" /> Actualizando… {patchProgress}%
            </span>
          )}
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            style={{
              fontSize: 13,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid var(--cui-secondary)',
              background: '#fff',
              width: 200,
            }}
          />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{
              fontSize: 13,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid var(--cui-secondary)',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              fontSize: 13,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid var(--cui-secondary)',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos</option>
            {ACCOUNT_MASTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_MASTER_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {showForm ? (
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setEditingRow(null)
              }}
            >
              <CIcon icon={cilX} /> Cancelar
            </CButton>
          ) : (
            <CButton
              size="sm"
              color="primary"
              onClick={() => {
                setShowForm(true)
                setEditingRow(null)
                gridRef.current?.instance.collapseAll(-1)
              }}
            >
              <CIcon icon={cilPlus} /> Nueva cuenta
            </CButton>
          )}
        </div>
      </CCardHeader>
      <CCardBody style={{ padding: 0 }}>
        <CCollapse visible={showForm}>
          <div className="p-3 border-bottom form-panel">
            <AccountMasterForm
              key={editingRow?.id ?? 'create'}
              initial={editingRow ?? undefined}
              saving={saving}
              onSave={
                editingRow
                  ? (p) => {
                      handleUpdate({ ...editingRow, ...p })
                      setShowForm(false)
                      setEditingRow(null)
                    }
                  : handleCreate
              }
              onCancel={() => {
                setShowForm(false)
                setEditingRow(null)
              }}
            />
          </div>
        </CCollapse>

        {fetching && !data ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner color="primary" />
          </div>
        ) : isMobile ? (
          <StandardList
            data={filtered}
            keyExpr="id"
            emptyText="Sin cuentas maestras registradas."
            inactive={(r) => r.active === false}
            renderTitle={(r) => (
              <>
                {r.important && <span style={{ color: '#e03131', marginRight: 4 }}>★</span>}
                {r.code && (
                  <span className={SL.mono} style={{ marginRight: 6 }}>
                    {r.code}
                  </span>
                )}
                {r.name}
              </>
            )}
            renderBadge={(r) => ({
              label: r.active ? 'Activo' : 'Inactivo',
              variant: r.active ? 'active' : 'inactive',
              onClick: () => {
                dispatch(accountsMasterActions.updateRequest({ ...r, active: !r.active }))
                dispatch(pushNotification({ type: 'success', message: 'Estado actualizado.' }))
              },
            })}
            renderRows={(r) => [
              [
                r.accountingName && <span className={SL.muted}>{r.accountingName}</span>,
                ACCOUNT_MASTER_TYPE_LABELS[r.type] ?? r.type,
              ],
              [
                r.defaultValue
                  ? new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(r.defaultValue)
                  : null,
                r.period && <span className={SL.label}>{r.period}</span>,
                r.paymentMethod,
              ],
              [r.notes && <span className={SL.muted}>{r.notes}</span>],
              [
                r.bankAccountNumber && <span className={SL.mono}>{r.bankAccountNumber}</span>,
                r.bankAccountNumber && (
                  <button
                    type="button"
                    className="sl__action-btn sl__action-btn--primary"
                    onClick={() => navigator.clipboard.writeText(r.bankAccountNumber)}
                  >
                    <CIcon icon={cilCopy} size="sm" />
                  </button>
                ),
              ],
            ]}
            renderActions={(r) => [
              {
                icon: cilPencil,
                color: 'primary',
                title: 'Editar',
                onClick: () => {
                  setEditingRow(r)
                  setShowForm(true)
                },
              },
              {
                icon: cilTrash,
                color: 'danger',
                title: 'Eliminar',
                onClick: () => handleDelete(r),
              },
            ]}
          />
        ) : (
          <StandardGrid
            ref={gridRef}
            keyExpr="id"
            dataSource={filtered}
            noDataText="Sin cuentas maestras registradas"
            style={{ margin: 0 }}
            pager={{ visible: false }}
            paging={{ enabled: false }}
          >
            <Column
              dataField="code"
              caption="Código"
              width={80}
              alignment="center"
              cellRender={({ value }) =>
                value ? (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 'var(--fs-base)',
                      color: '#1e3a5f',
                    }}
                  >
                    {value}
                  </span>
                ) : (
                  <span style={{ color: '#dee2e6', fontSize: 'var(--fs-base)' }}>—</span>
                )
              }
            />
            <Column
              dataField="name"
              caption="Nombre"
              minWidth={160}
              cellRender={({ value, data: row }) => (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {row.important && (
                    <span style={{ color: '#e03131', fontSize: 'var(--fs-base)', lineHeight: 1 }}>★</span>
                  )}
                  {value}
                </span>
              )}
            />
            <Column
              dataField="accountingName"
              caption="Nombre Contable"
              minWidth={200}
              cellRender={({ value }) =>
                value ? (
                  <span style={{ fontSize: 'var(--fs-base)', color: '#374151' }}>{value}</span>
                ) : (
                  <span style={{ color: '#dee2e6', fontSize: 'var(--fs-base)' }}>—</span>
                )
              }
            />
            <Column
              dataField="type"
              caption="Tipo"
              width={95}
              alignment="center"
              cellRender={({ value }) => {
                const c = TYPE_COLOR[value] ?? {}
                return (
                  <span
                    style={{
                      fontSize: 'var(--fs-base)',
                      fontWeight: 600,
                      borderRadius: 4,
                      padding: '2px 8px',
                      background: c.bg,
                      color: c.color,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    {ACCOUNT_MASTER_TYPE_LABELS[value] ?? value}
                  </span>
                )
              }}
            />
            <Column
              caption="Naturaleza"
              width={95}
              alignment="center"
              allowSorting={false}
              cellRender={({ data: row }) => {
                const nature = ACCOUNT_MASTER_NATURE[row.type] ?? '—'
                const c = NATURE_COLOR[nature] ?? {}
                return (
                  <span
                    style={{
                      fontSize: 'var(--fs-base)',
                      fontWeight: 600,
                      borderRadius: 4,
                      padding: '2px 8px',
                      background: c.bg,
                      color: c.color,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    {nature}
                  </span>
                )
              }}
            />
            <Column
              dataField="defaultValue"
              caption="Valor por defecto"
              width={145}
              alignment="right"
              hidingPriority={0}
              cellRender={({ value }) =>
                value ? (
                  <span style={{ fontWeight: 600, color: '#1e3a5f' }}>
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(value)}
                  </span>
                ) : (
                  <span style={{ color: '#adb5bd', fontSize: 'var(--fs-base)' }}>—</span>
                )
              }
            />
            <Column dataField="period" caption="Período" width={100} hidingPriority={1} />
            <Column
              dataField="paymentMethod"
              caption="Método pago"
              width={120}
              hidingPriority={2}
            />
            <Column
              dataField="notes"
              caption="Notas"
              minWidth={120}
              hidingPriority={3}
              cellRender={({ value }) =>
                value ? (
                  <span
                    title={value}
                    style={{
                      display: 'block',
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 'var(--fs-base)',
                      color: '#495057',
                      cursor: 'default',
                    }}
                  >
                    {value}
                  </span>
                ) : (
                  <span style={{ color: '#dee2e6', fontSize: 'var(--fs-base)' }}>—</span>
                )
              }
            />
            <Column
              dataField="active"
              caption="Estado"
              width={85}
              alignment="center"
              cellRender={({ value, data: row }) => (
                <StatusBadge
                  active={value}
                  onClick={() => {
                    dispatch(accountsMasterActions.updateRequest({ ...row, active: !row.active }))
                    dispatch(pushNotification({ type: 'success', message: 'Estado actualizado.' }))
                  }}
                />
              )}
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
                    onClick={() => toggleRow(row)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#1e3a5f',
                      fontSize: 'var(--fs-base)',
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
                      fontSize: 'var(--fs-base)',
                      padding: '2px 4px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            />
            <MasterDetail
              enabled
              render={({ data: row }) => (
                <div
                  style={{ padding: 16, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                >
                  <AccountMasterForm
                    key={row.id}
                    initial={row}
                    saving={saving}
                    onSave={(p) => handleUpdate({ ...row, ...p })}
                    onCancel={() => gridRef.current?.instance.collapseRow(row.id)}
                  />
                </div>
              )}
            />
          </StandardGrid>
        )}
      </CCardBody>
    </CCard>
  )
}
