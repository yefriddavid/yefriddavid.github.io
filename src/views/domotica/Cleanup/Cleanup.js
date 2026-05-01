import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CBadge,
  CButton,
} from '@coreui/react'
import { Column, Paging, Pager } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import * as txActions from 'src/actions/domotica/domoticaTransactionActions'
import './Cleanup.scss'

const TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'voltaje', label: 'Voltaje' },
  { value: 'corriente', label: 'Corriente' },
]

const toLocalDatetimeValue = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const defaultFrom = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  d.setHours(0, 0, 0, 0)
  return toLocalDatetimeValue(d)
}

const defaultTo = () => {
  const d = new Date()
  d.setHours(23, 59, 59, 0)
  return toLocalDatetimeValue(d)
}

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function Cleanup() {
  const dispatch = useDispatch()
  const { cleanupPreviewing, cleanupPreview, cleanupDeleting, cleanupDeleted, cleanupError } =
    useSelector((s) => s.domoticaTransaction)

  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [type, setType] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const params = { from: new Date(from).toISOString(), to: new Date(to).toISOString(), type }
  const cleanupCount = cleanupPreview?.length ?? null

  const handlePreview = () => dispatch(txActions.cleanupPreviewRequest(params))

  const handleDelete = () => {
    setConfirmOpen(false)
    dispatch(txActions.cleanupDeleteRequest(params))
  }

  const rangeValid = from && to && new Date(from) < new Date(to)

  return (
    <div className="cleanup">
      <CCard className="cleanup__card">
        <CCardHeader className="cleanup__header">
          <strong>Limpieza de transacciones</strong>
          <span className="cleanup__subtitle">Domotica_transactions</span>
        </CCardHeader>

        <CCardBody className="cleanup__body">
          {/* ── Filters ── */}
          <div className="cleanup__section-label">Rango de fechas y tipo</div>
          <div className="cleanup__filters">
            <div className="cleanup__field">
              <label className="cleanup__label">Desde</label>
              <input
                className="cleanup__input"
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="cleanup__field">
              <label className="cleanup__label">Hasta</label>
              <input
                className="cleanup__input"
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="cleanup__field">
              <label className="cleanup__label">Tipo</label>
              <select
                className="cleanup__input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="cleanup__actions">
            <CButton
              color="primary"
              variant="outline"
              disabled={!rangeValid || cleanupPreviewing || cleanupDeleting}
              onClick={handlePreview}
            >
              {cleanupPreviewing ? <CSpinner size="sm" className="me-2" /> : null}
              {cleanupPreviewing ? 'Buscando…' : 'Previsualizar documentos'}
            </CButton>
          </div>

          {/* ── Result ── */}
          {cleanupError && (
            <div className="cleanup__result cleanup__result--error">Error: {cleanupError}</div>
          )}

          {cleanupDeleted !== null && (
            <div className="cleanup__result cleanup__result--success">
              <span className="cleanup__result-icon">✓</span>
              Se eliminaron <strong>{cleanupDeleted}</strong> documento
              {cleanupDeleted !== 1 ? 's' : ''} correctamente.
            </div>
          )}

          {cleanupPreview !== null && cleanupDeleted === null && (
            <div className="cleanup__result cleanup__result--count">
              <div className="cleanup__count-row">
                <span className="cleanup__count-label">Documentos en el rango</span>
                <CBadge
                  color={cleanupCount === 0 ? 'secondary' : 'danger'}
                  className="cleanup__count-badge"
                >
                  {cleanupCount}
                </CBadge>
              </div>

              {cleanupCount > 0 && (
                <>
                  <CButton
                    color="danger"
                    disabled={cleanupDeleting}
                    onClick={() => setConfirmOpen(true)}
                    className="cleanup__delete-btn"
                  >
                    {cleanupDeleting ? <CSpinner size="sm" className="me-2" /> : null}
                    {cleanupDeleting
                      ? 'Eliminando…'
                      : `Eliminar ${cleanupCount} documento${cleanupCount !== 1 ? 's' : ''}`}
                  </CButton>

                  <StandardGrid
                    dataSource={cleanupPreview}
                    keyExpr="id"
                    style={{ margin: 0 }}
                  >
                    <Paging defaultPageSize={20} />
                    <Pager showPageSizeSelector={true} allowedPageSizes={[20, 50, 100]} showInfo={true} />
                    <Column dataField="type" caption="Tipo" width={100} />
                    <Column dataField="device" caption="Dispositivo" width={130} />
                    <Column dataField="value" caption="Valor" width={90} />
                    <Column dataField="unit" caption="Unidad" width={80} />
                    <Column
                      dataField="createdAt"
                      caption="Fecha"
                      width={170}
                      calculateCellValue={(row) => formatDate(row.createdAt)}
                    />
                    <Column dataField="description" caption="Descripción" />
                    <Column dataField="notes" caption="Notas" />
                  </StandardGrid>
                </>
              )}

              {cleanupCount === 0 && (
                <span className="cleanup__empty">No hay documentos en ese rango.</span>
              )}
            </div>
          )}

          {/* ── Info box ── */}
          <div className="cleanup__info">
            <strong>Nota:</strong> Esta operación es permanente e irreversible. Verifica el rango
            antes de eliminar.
          </div>
        </CCardBody>
      </CCard>

      {/* ── Confirm modal ── */}
      <CModal visible={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
        <CModalHeader>
          <CModalTitle>Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody className="cleanup__confirm-body">
          <p>
            Se eliminarán permanentemente <strong>{cleanupCount}</strong> documento
            {cleanupCount !== 1 ? 's' : ''} del rango:
          </p>
          <div className="cleanup__confirm-range">
            <span>{from.replace('T', ' ')}</span>
            <span className="cleanup__confirm-arrow">→</span>
            <span>{to.replace('T', ' ')}</span>
          </div>
          {type && (
            <div className="cleanup__confirm-type">
              Tipo: <strong>{type}</strong>
            </div>
          )}
          <p className="cleanup__confirm-warn">Esta acción no se puede deshacer.</p>
          <div className="cleanup__confirm-actions">
            <CButton color="secondary" variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Eliminar
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </div>
  )
}
