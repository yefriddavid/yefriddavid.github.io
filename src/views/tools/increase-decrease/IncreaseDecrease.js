import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/finance/increaseDecreaseActions'

const formatToCOP = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(value))
}

const formatToUSD = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(value))
}

const formatPct = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${parseFloat(value).toFixed(2)}%`
}

const computeFields = ({ initialValue, finalValue, inversionValue }) => {
  const init = Number(initialValue)
  const fin = Number(finalValue)
  const inv = Number(inversionValue)
  const diff = fin - init
  const pct = init > 0 ? (diff / init) * 100 : 0
  const inversionProfit = (inv * pct) / 100
  return {
    initialValue: init,
    finalValue: fin,
    inversionValue: inv,
    diff,
    increaseValue: diff >= 0 ? parseFloat(pct.toFixed(4)) : null,
    decreaseValue: diff < 0 ? parseFloat(Math.abs(pct).toFixed(4)) : null,
    profit: diff >= 0 ? parseFloat(inversionProfit.toFixed(2)) : null,
    loss: diff < 0 ? parseFloat(Math.abs(inversionProfit).toFixed(2)) : null,
    earnUSD: parseFloat(inversionProfit.toFixed(2)),
    earnCOP: parseFloat((inversionProfit * 4000).toFixed(0)),
  }
}

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const EntryForm = ({ initial, onSave, onCancel, saving, title }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  return (
    <StandardForm title={title} onCancel={onCancel} onSave={handleSubmit(onSave)} saving={saving}>
      <StandardField label="Initial Value">
        <input
          className={SF.input}
          type="number"
          {...register('initialValue', { required: 'Required' })}
        />
        {fieldError(errors.initialValue)}
      </StandardField>
      <StandardField label="Final Value">
        <input
          className={SF.input}
          type="number"
          {...register('finalValue', { required: 'Required' })}
        />
        {fieldError(errors.finalValue)}
      </StandardField>
      <StandardField label="Investment Amount">
        <input
          className={SF.input}
          type="number"
          {...register('inversionValue', { required: 'Required' })}
        />
        {fieldError(errors.inversionValue)}
      </StandardField>
    </StandardForm>
  )
}

const IncreaseDecrease = () => {
  const dispatch = useDispatch()
  const { entries, loading, saving } = useSelector((s) => s.increaseDecrease)

  const [initialValue, setInitialValue] = useState(107500)
  const [finalValue, setFinalValue] = useState(111490)
  const [inversionValue, setInversionValue] = useState(500)
  const [editingEntry, setEditingEntry] = useState(null)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

  const computed = computeFields({ initialValue, finalValue, inversionValue })
  const isProfit = computed.diff >= 0

  const handleAdd = () => {
    dispatch(actions.saveRequest(computed))
  }

  const handleEditSave = (formValues) => {
    const updated = computeFields(formValues)
    dispatch(actions.updateRequest({ ...updated, id: editingEntry.id }))
    setEditingEntry(null)
  }

  const handleDelete = (id) => {
    dispatch(actions.deleteRequest({ id }))
  }

  return (
    <>
      <CRow className="g-4">
        {/* Input card */}
        <CCol xs={12} md={5} lg={4}>
          <CCard className="h-100 shadow-sm">
            <CCardHeader className="fw-semibold">Values</CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <div>
                <CFormLabel className="fw-medium mb-1">Initial Value</CFormLabel>
                <CFormInput
                  type="number"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                />
              </div>
              <div>
                <CFormLabel className="fw-medium mb-1">Final Value</CFormLabel>
                <CFormInput
                  type="number"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                />
              </div>
              <div>
                <CFormLabel className="fw-medium mb-1">Investment Amount</CFormLabel>
                <CFormInput
                  type="number"
                  value={inversionValue}
                  onChange={(e) => setInversionValue(e.target.value)}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Results card */}
        <CCol xs={12} md={7} lg={8}>
          <CCard className="h-100 shadow-sm">
            <CCardHeader className="fw-semibold">Results</CCardHeader>
            <CCardBody>
              <CRow className="g-3 mb-4">
                <CCol xs={6} sm={4}>
                  <div className="border rounded p-3 text-center">
                    <div className="text-medium-emphasis small mb-1">Difference</div>
                    <div className={`fs-5 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {formatToCOP(computed.diff)}
                    </div>
                  </div>
                </CCol>

                <CCol xs={6} sm={4}>
                  <div className="border rounded p-3 text-center">
                    <div className="text-medium-emphasis small mb-1">
                      {isProfit ? 'Increase %' : 'Decrease %'}
                    </div>
                    <div className={`fs-5 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {formatPct(Math.abs(isProfit ? computed.increaseValue : computed.decreaseValue))}
                    </div>
                  </div>
                </CCol>

                <CCol xs={6} sm={4}>
                  <div className="border rounded p-3 text-center">
                    <div className="text-medium-emphasis small mb-1">
                      {isProfit ? 'Investment Profit' : 'Investment Loss'}
                    </div>
                    <div className={`fs-5 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {formatPct(Math.abs(isProfit ? computed.profit : computed.loss))}
                    </div>
                  </div>
                </CCol>

                <CCol xs={12} sm={4}>
                  <div className="border rounded p-3 text-center">
                    <div className="text-medium-emphasis small mb-1">Earn / Loss (USD)</div>
                    <div className={`fs-4 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {formatToUSD(computed.earnUSD)}
                    </div>
                  </div>
                </CCol>

                <CCol xs={12} sm={4}>
                  <div className="border rounded p-3 text-center">
                    <div className="text-medium-emphasis small mb-1">Earn / Loss (COP)</div>
                    <div className={`fs-4 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {formatToCOP(computed.earnCOP)}
                    </div>
                  </div>
                </CCol>

                <CCol xs={12} sm={4} className="d-flex align-items-end">
                  <CButton color="primary" className="w-100" onClick={handleAdd} disabled={saving}>
                    {saving ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <CIcon icon={cilPlus} className="me-1" />
                        Add to List
                      </>
                    )}
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>

        {/* List */}
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardHeader className="fw-semibold">
              Comparison List
              {loading && <Spinner size="sm" className="ms-2" />}
            </CCardHeader>
            <CCardBody className="p-0">
              {loading ? (
                <Spinner mode="section" />
              ) : (
                <StandardCard
                  data={entries}
                  keyExpr="id"
                  emptyText="No entries yet — fill in the values above and click Add to List."
                  renderTitle={(e) => (
                    <>
                      <span className={SC.muted}>{e.initialValue?.toLocaleString()}</span>
                      {' → '}
                      <span>{e.finalValue?.toLocaleString()}</span>
                    </>
                  )}
                  renderValue={(e) => (
                    <span style={{ color: e.earnUSD >= 0 ? '#2eb85c' : '#e55353' }}>
                      {formatToUSD(e.earnUSD)}
                    </span>
                  )}
                  renderBadge={(e) =>
                    e.earnUSD >= 0
                      ? { label: 'Profit', variant: 'active' }
                      : { label: 'Loss', variant: 'warning' }
                  }
                  renderRows={(e) => [
                    [
                      <>
                        <span className={SC.label}>Diff </span>
                        <span style={{ color: e.diff >= 0 ? '#2eb85c' : '#e55353' }}>
                          {formatToCOP(e.diff)}
                        </span>
                      </>,
                      e.increaseValue != null
                        ? `+${formatPct(e.increaseValue)}`
                        : e.decreaseValue != null
                          ? `-${formatPct(e.decreaseValue)}`
                          : null,
                    ],
                    [
                      <>
                        <span className={SC.label}>Inv </span>
                        {e.inversionValue?.toLocaleString()}
                      </>,
                      <>
                        <span className={SC.label}>COP </span>
                        <span style={{ color: e.earnCOP >= 0 ? '#2eb85c' : '#e55353' }}>
                          {formatToCOP(e.earnCOP)}
                        </span>
                      </>,
                    ],
                  ]}
                  renderActions={(e) => [
                    {
                      icon: cilPencil,
                      color: 'primary',
                      title: 'Edit',
                      onClick: () => setEditingEntry(e),
                    },
                    {
                      icon: cilTrash,
                      color: 'danger',
                      title: 'Delete',
                      onClick: () => handleDelete(e.id),
                    },
                  ]}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Edit modal */}
      <CModal visible={!!editingEntry} onClose={() => setEditingEntry(null)}>
        <CModalHeader>
          <CModalTitle>Edit Entry</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {editingEntry && (
            <EntryForm
              key={editingEntry.id}
              title="Edit Entry"
              initial={{
                initialValue: String(editingEntry.initialValue),
                finalValue: String(editingEntry.finalValue),
                inversionValue: String(editingEntry.inversionValue),
              }}
              onSave={handleEditSave}
              onCancel={() => setEditingEntry(null)}
              saving={saving}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default IncreaseDecrease
