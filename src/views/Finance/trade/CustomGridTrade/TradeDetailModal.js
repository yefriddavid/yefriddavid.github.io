import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
} from '@coreui/react'

const labelStyle = { fontSize: 11, fontWeight: 700, color: '#868e96', letterSpacing: '0.05em' }

const TradeDetailModal = ({ detailModal, editForm, setEditForm, onClose, onSave }) => (
  <CModal visible={!!detailModal} onClose={onClose} alignment="center">
    <CModalHeader>
      <CModalTitle>Detalle de Operación</CModalTitle>
    </CModalHeader>
    <CModalBody>
      {detailModal && editForm && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <CFormLabel style={labelStyle}>PRECIO DE ENTRADA</CFormLabel>
            <CFormInput
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <div>
            <CFormLabel style={labelStyle}>CANTIDAD</CFormLabel>
            <CFormInput
              type="number"
              step="any"
              value={editForm.quantity}
              onChange={(e) => setEditForm((p) => ({ ...p, quantity: e.target.value }))}
            />
          </div>
          <div>
            <CFormLabel style={labelStyle}>FECHA DE ENTRADA</CFormLabel>
            <CFormInput
              type="date"
              value={editForm.fecha}
              onChange={(e) => setEditForm((p) => ({ ...p, fecha: e.target.value }))}
            />
          </div>
          <div>
            <CFormLabel style={labelStyle}>NOTAS</CFormLabel>
            <CFormInput
              value={editForm.notes}
              onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Observaciones…"
            />
          </div>
        </div>
      )}
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={onClose}>
        Cancelar
      </CButton>
      <CButton color="primary" onClick={onSave}>
        Guardar
      </CButton>
    </CModalFooter>
  </CModal>
)

export default TradeDetailModal
