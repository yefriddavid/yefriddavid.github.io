import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid/StandardGrid'
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
import * as accountsMasterActions from 'src/actions/CashFlow/accountsMasterActions'
import { CLASSIFICATION_OPTIONS, ACCOUNT_CATEGORIES, PERIOD_OPTIONS, TYPE_OPTIONS,
  PAYMENT_METHODS, MONTH_NAMES, MONTH_LABELS } from 'src/constants/cashFlow'


import { SEED_ACCOUNTS } from 'src/constants/accountsMasterSeed'
import '../../../movements/payments/Payments.scss'
import '../../../movements/payments/ItemDetail.scss'

const EMPTY_FORM = {
  type: 'Outcoming',
  period: 'Mensuales',
  targetAmount: '',
  definition: '',
  classification: 'dispensable',
  category: '',
  maxDatePay: 15,
  monthStartAt: 'January',
  paymentMethod: 'Cash',
  code: '',
  name: '',
  description: '',
  notes: '',
  defaultValue: '',
  active: true,
  important: false,
}

//const PERIOD_OPTIONS = ['Mensuales', 'Trimestrales', 'Cuatrimestrales', 'Semestrales', 'Anuales', 'N/A']
//const TYPE_OPTIONS = ['Outcoming', 'Incoming']
//const CLASSIFICATION_OPTIONS = ['dispensable', 'indispensable']

// ── Form ──────────────────────────────────────────────────────────────────────
function AccountMasterForm({ initial, saving, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)

  const set = (field) => (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
  }

  const isEdit = !!initial?.id

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">
          {isEdit ? 'Editar cuenta maestra' : 'Nueva cuenta maestra'}
        </span>
      </div>
      <div className="payment-form__body">
        <div className="payment-form__field">
          <label className="payment-form__label">Nombre *</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Nombre de la cuenta"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Descripción</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.description}
            onChange={set('description')}
            placeholder="Descripción corta"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Notas</label>
          <textarea
            className="payment-form__input"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Comentarios u observaciones adicionales…"
            rows={3}
            style={{ resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Tipo</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.type}
              onChange={set('type')}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Período</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.period}
              onChange={set('period')}
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Clasificación</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.classification}
              onChange={set('classification')}
            >
              {CLASSIFICATION_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Categoría</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.category}
              onChange={set('category')}
            >
              <option value="">Sin categoría</option>
              {ACCOUNT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Día máximo de pago</label>
            <input
              className="payment-form__input"
              type="number"
              min={1}
              max={31}
              value={form.maxDatePay}
              onChange={set('maxDatePay')}
            />
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Método de pago</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.paymentMethod}
              onChange={set('paymentMethod')}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(form.period === 'Anuales' ||
          form.period === 'Trimestrales' ||
          form.period === 'Cuatrimestrales' ||
          form.period === 'Semestrales' ||
          form.period === 'N/A') && (
          <div className="payment-form__field">
            <label className="payment-form__label">Mes de inicio / aplica</label>
            <select
              className="payment-form__input payment-form__input--select"
              value={form.monthStartAt}
              onChange={set('monthStartAt')}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={m}>
                  {MONTH_LABELS[i]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="payment-form__field">
          <label className="payment-form__label">Valor por defecto (COP)</label>
          <input
            className="payment-form__input"
            type="number"
            value={form.defaultValue}
            onChange={set('defaultValue')}
            placeholder="0 — opcional"
            min="0"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">
            Deuda total a pagar (COP)
            <span style={{ fontSize: 11, color: '#6c757d', fontWeight: 400, marginLeft: 6 }}>
              — dejar vacío si no es una deuda
            </span>
          </label>
          <input
            className="payment-form__input"
            type="number"
            value={form.targetAmount}
            onChange={set('targetAmount')}
            placeholder="0 — opcional"
            min="0"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="payment-form__field">
            <label className="payment-form__label">Definición</label>
            <input
              className="payment-form__input"
              type="text"
              value={form.definition}
              onChange={set('definition')}
              placeholder="Ej: Indefinidos"
            />
          </div>

          <div className="payment-form__field">
            <label className="payment-form__label">Código</label>
            <input
              className="payment-form__input"
              type="text"
              value={form.code}
              onChange={set('code')}
              placeholder="Código (opcional)"
            />
          </div>
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Estado</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.active ? 'true' : 'false'}
            onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value === 'true' }))}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>

        <div
          className="payment-form__field"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setForm((prev) => ({ ...prev, important: !prev.important }))}
        >
          <input
            type="checkbox"
            checked={!!form.important}
            onChange={(e) => setForm((prev) => ({ ...prev, important: e.target.checked }))}
            style={{ width: 18, height: 18, accentColor: '#e03131', cursor: 'pointer', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          />
          <label className="payment-form__label" style={{ marginBottom: 0, cursor: 'pointer' }}>
            <span style={{ color: '#e03131', marginRight: 4 }}>★</span>Importante
          </label>
        </div>
      </div>

      <div className="payment-form__actions">
        <CButton
          className="payment-form__btn payment-form__btn--cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </CButton>
        <CButton
          className="payment-form__btn payment-form__btn--save"
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
        >
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AccountsMaster() {
  const dispatch = useDispatch()
  const { data, fetching, saving, seeding, seedProgress } = useSelector((s) => s.accountsMaster)
  const [formModal, setFormModal] = useState(null) // null | { mode: 'create' | 'edit', initial?: {} }
  const [typeFilter, setTypeFilter] = useState('all')
  const [nameSearch, setNameSearch] = useState('')

  useEffect(() => {
    dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch])

  const filtered = (data ?? []).filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
              <option value="Outcoming">Outcoming</option>
              <option value="Incoming">Incoming</option>
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
              <Column dataField="code" caption="Código" width={90} />
              <Column
                dataField="name"
                caption="Nombre"
                minWidth={200}
                cellRender={({ value, data: row }) => (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {row.important && (
                      <span style={{ color: '#e03131', fontSize: 13, lineHeight: 1 }}>★</span>
                    )}
                    {value}
                  </span>
                )}
              />
              {/*}<Column dataField="description" caption="Descripción" minWidth={200} />*/}
              <Column
                dataField="defaultValue"
                caption="Valor por defecto"
                width={150}
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
              <Column dataField="type" caption="Tipo" width={110} />
              <Column dataField="period" caption="Período" width={110} />
              {/*<Column dataField="definition" caption="Definición" width={120} />*/}
              {/*<Column
                dataField="classification"
                caption="Clasificación"
                width={130}
                cellRender={({ value }) => (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 4,
                      padding: '2px 8px',
                      background: value === 'indispensable' ? '#fff3cd' : '#f8f9fa',
                      color: value === 'indispensable' ? '#856404' : '#495057',
                      border: `1px solid ${value === 'indispensable' ? '#ffc107' : '#dee2e6'}`,
                    }}
                  >
                    {value}
                  </span>
                )}
                />*/}
              {/*<Column dataField="category" caption="Categoría" width={150} />*/}
              <Column
                dataField="maxDatePay"
                caption="Día máx. pago"
                width={120}
                alignment="center"
              />
              {/*}<Column dataField="monthStartAt" caption="Mes inicio" width={120} />*/}
              <Column dataField="paymentMethod" caption="Método pago" width={130} />
              <Column
                dataField="notes"
                caption="Notas"
                minWidth={120}
                hidingPriority={1}
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
                width={90}
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
