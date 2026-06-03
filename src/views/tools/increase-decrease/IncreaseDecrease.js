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
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilX, cilCopy } from '@coreui/icons'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
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

const IncreaseDecrease = () => {
  const dispatch = useDispatch()
  const { entries, loading, saving } = useSelector((s) => s.increaseDecrease)

  const DEFAULTS = { initialValue: 107500, finalValue: 111490, inversionValue: 500 }
  const [initialValue, setInitialValue] = useState(DEFAULTS.initialValue)
  const [finalValue, setFinalValue] = useState(DEFAULTS.finalValue)
  const [inversionValue, setInversionValue] = useState(DEFAULTS.inversionValue)
  const [editingEntry, setEditingEntry] = useState(null)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

  const computed = computeFields({ initialValue, finalValue, inversionValue })
  const isProfit = computed.diff >= 0

  const handleSubmit = () => {
    if (editingEntry) {
      dispatch(actions.updateRequest({ ...computed, id: editingEntry.id }))
      setEditingEntry(null)
      setInitialValue(DEFAULTS.initialValue)
      setFinalValue(DEFAULTS.finalValue)
      setInversionValue(DEFAULTS.inversionValue)
    } else {
      dispatch(actions.saveRequest(computed))
    }
  }

  const handleEditClick = (e) => {
    setEditingEntry(e)
    setInitialValue(e.initialValue)
    setFinalValue(e.finalValue)
    setInversionValue(e.inversionValue)
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
    setInitialValue(DEFAULTS.initialValue)
    setFinalValue(DEFAULTS.finalValue)
    setInversionValue(DEFAULTS.inversionValue)
  }

  const handleClone = (e) => {
    const { id: _, createdAt: _c, updatedAt: _u, ...rest } = e
    dispatch(actions.saveRequest(rest))
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
            <CCardHeader className="fw-semibold d-flex align-items-center justify-content-between">
              <span>{editingEntry ? 'Edit Entry' : 'Values'}</span>
              {editingEntry && (
                <CButton color="ghost" size="sm" onClick={handleCancelEdit} title="Cancel">
                  <CIcon icon={cilX} />
                </CButton>
              )}
            </CCardHeader>
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
                  <CButton
                    color={editingEntry ? 'warning' : 'primary'}
                    className="w-100"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <CIcon icon={editingEntry ? cilPencil : cilPlus} className="me-1" />
                        {editingEntry ? 'Update Entry' : 'Add to List'}
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
                      <span className={SC.label}>Initial </span>
                      <span className={SC.mono}>{e.initialValue?.toLocaleString()}</span>
                      <span className={SC.muted}>{' → '}</span>
                      <span className={SC.label}>Final </span>
                      <span className={SC.mono}>{e.finalValue?.toLocaleString()}</span>
                    </>
                  )}
                  renderValue={(e) => (
                    <span
                      style={{ color: e.earnUSD >= 0 ? '#2eb85c' : '#e55353', fontWeight: 700 }}
                    >
                      {formatToUSD(e.earnUSD)}
                    </span>
                  )}
                  renderBadge={(e) =>
                    e.earnUSD >= 0
                      ? { label: 'Profit', variant: 'active' }
                      : { label: 'Loss', variant: 'warning' }
                  }
                  renderRows={(e) => {
                    const gain = e.earnUSD >= 0
                    const color = gain ? '#2eb85c' : '#e55353'
                    const pctLabel = gain ? '+' : '-'
                    const pctVal = e.increaseValue != null ? e.increaseValue : e.decreaseValue
                    return [
                      [
                        <>
                          <span className={SC.label}>Difference </span>
                          <span style={{ color }}>{formatToCOP(e.diff)}</span>
                        </>,
                        <>
                          <span key="pct-lbl" className={SC.label}>
                            {gain ? 'Increase ' : 'Decrease '}
                          </span>
                          <span key="pct-val" style={{ color }}>
                            {pctLabel}
                            {formatPct(pctVal)}
                          </span>
                        </>,
                      ],
                      [
                        <>
                          <span className={SC.label}>Inv. {gain ? 'Profit ' : 'Loss '}</span>
                          <span style={{ color }}>
                            {formatPct(Math.abs(gain ? e.profit : e.loss))}
                          </span>
                        </>,
                        <>
                          <span className={SC.label}>Earn COP </span>
                          <span style={{ color }}>{formatToCOP(e.earnCOP)}</span>
                        </>,
                      ],
                      [
                        <>
                          <span className={SC.label}>Investment </span>
                          <span className={SC.mono}>{formatToUSD(e.inversionValue)}</span>
                        </>,
                      ],
                    ]
                  }}
                  renderActions={(e) => [
                    {
                      icon: cilPencil,
                      color: 'primary',
                      title: 'Edit',
                      onClick: () => handleEditClick(e),
                    },
                    {
                      icon: cilCopy,
                      color: 'info',
                      title: 'Clone',
                      onClick: () => handleClone(e),
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
    </>
  )
}

export default IncreaseDecrease
