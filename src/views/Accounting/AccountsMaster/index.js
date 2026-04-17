import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
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
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import {
  ACCOUNT_MASTER_TYPES,
  ACCOUNT_MASTER_TYPE_LABELS,
  ACCOUNT_MASTER_NATURE,
} from 'src/constants/accounting'
import { SEED_ACCOUNTS, PATCH_ACCOUNTING } from 'src/constants/accountsMasterSeed'
import AccountMasterForm from './AccountMasterForm'
import '../../movements/payments/Payments.scss'
import '../../movements/payments/ItemDetail.scss'

const NATURE_COLOR = {
  Débito: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  Crédito: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
}

const TYPE_COLOR = {
  Activo: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  Pasivo: { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  Incoming: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  Outcoming: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

export default function AccountsMaster() {
  const dispatch = useDispatch()
  const { data, fetching, saving, seeding, seedProgress, patching, patchProgress } = useSelector(
    (s) => s.accountsMaster,
  )
  const [formModal, setFormModal] = useState(null)
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

  const handleCreate = (payload) => {
    dispatch(accountsMasterActions.createRequest(payload))
    setFormModal(null)
  }

  const handleUpdate = (payload) => {
    dispatch(accountsMasterActions.updateRequest(payload))
    setFormModal(null)
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
                <CSpinner size="sm" /> Cargando… {seedProgress}%
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
                <CSpinner size="sm" /> Actualizando… {patchProgress}%
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
            <CButton size="sm" color="primary" onClick={() => setFormModal({ mode: 'create' })}>
              + Nueva cuenta
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody style={{ padding: 0 }}>
          {fetching && !data ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <CSpinner color="primary" />
            </div>
          ) : (
            <StandardGrid
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
                        fontSize: 13,
                        color: '#1e3a5f',
                      }}
                    >
                      {value}
                    </span>
                  ) : (
                    <span style={{ color: '#dee2e6', fontSize: 11 }}>—</span>
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
                      <span style={{ color: '#e03131', fontSize: 13, lineHeight: 1 }}>★</span>
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
                    <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>
                  ) : (
                    <span style={{ color: '#dee2e6', fontSize: 11 }}>—</span>
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
                        fontSize: 11,
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
                        fontSize: 11,
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
                    <span style={{ color: '#adb5bd', fontSize: 11 }}>—</span>
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
                        fontSize: 12,
                        color: '#495057',
                        cursor: 'default',
                      }}
                    >
                      {value}
                    </span>
                  ) : (
                    <span style={{ color: '#dee2e6', fontSize: 11 }}>—</span>
                  )
                }
              />
              <Column
                dataField="active"
                caption="Estado"
                width={85}
                alignment="center"
                cellRender={({ value, data: row }) => (
                  <span
                    onClick={() =>
                      dispatch(accountsMasterActions.updateRequest({ ...row, active: !row.active }))
                    }
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 4,
                      padding: '2px 8px',
                      background: value ? '#f0fdf4' : '#fff5f5',
                      color: value ? '#2f9e44' : '#e03131',
                      border: `1px solid ${value ? '#86efac' : '#fca5a5'}`,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {value ? 'Activo' : 'Inactivo'}
                  </span>
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
            </StandardGrid>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={!!formModal} onClose={() => setFormModal(null)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>
            {formModal?.mode === 'edit' ? 'Editar cuenta maestra' : 'Nueva cuenta maestra'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 0 }}>
          {formModal && (
            <AccountMasterForm
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
