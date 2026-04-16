import React, { useState } from 'react'
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
import { Column, Paging, Pager } from 'devextreme-react/data-grid'
//import StandardGrid from 'src/components/shared/StandardGrid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'

const formatToCOP = (value) => {
  if (!value || isNaN(value)) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(value))
}

const formatPct = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${parseFloat(value).toFixed(2)}%`
}

const IncreaseDecrease = () => {
  const [initialValue, setInitialValue] = useState(107500)
  const [finalValue, setFinalValue] = useState(111490)
  const [inversionValue, setInversionValue] = useState(500)
  const [items, setItems] = useState([])

  const diff = Number(finalValue) - Number(initialValue)
  const increaseValue = Number(initialValue) > 0 ? (diff / Number(initialValue)) * 100 : 0
  const decreaseValue = diff < 0 ? Math.abs(increaseValue) : null
  const inversionProfit = (Number(inversionValue) * increaseValue) / 100
  const earnCOP = inversionProfit * 4000

  const handleAdd = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        initialValue: Number(initialValue),
        finalValue: Number(finalValue),
        diff,
        increaseValue: diff >= 0 ? parseFloat(increaseValue.toFixed(4)) : null,
        decreaseValue: diff < 0 ? parseFloat(Math.abs(increaseValue).toFixed(4)) : null,
        inversionValue: Number(inversionValue),
        profit: diff >= 0 ? parseFloat(inversionProfit.toFixed(2)) : null,
        loss: diff < 0 ? parseFloat(Math.abs(inversionProfit).toFixed(2)) : null,
      },
    ])
  }

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const isProfit = diff >= 0

  return (
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
                    {formatToCOP(diff)}
                  </div>
                </div>
              </CCol>

              <CCol xs={6} sm={4}>
                <div className="border rounded p-3 text-center">
                  <div className="text-medium-emphasis small mb-1">
                    {isProfit ? 'Increase %' : 'Decrease %'}
                  </div>
                  <div className={`fs-5 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                    {formatPct(Math.abs(increaseValue))}
                  </div>
                </div>
              </CCol>

              <CCol xs={6} sm={4}>
                <div className="border rounded p-3 text-center">
                  <div className="text-medium-emphasis small mb-1">
                    {isProfit ? 'Investment Profit' : 'Investment Loss'}
                  </div>
                  <div className={`fs-5 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                    {formatPct(Math.abs(inversionProfit))}
                  </div>
                </div>
              </CCol>

              <CCol xs={12} sm={8}>
                <div className="border rounded p-3 text-center">
                  <div className="text-medium-emphasis small mb-1">Earn / Loss (COP)</div>
                  <div className={`fs-4 fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                    {formatToCOP(earnCOP)}
                  </div>
                </div>
              </CCol>

              <CCol xs={12} sm={4} className="d-flex align-items-end">
                <CButton color="primary" className="w-100" onClick={handleAdd}>
                  <CIcon icon={cilPlus} className="me-1" />
                  Add to List
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Table */}
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="fw-semibold">Comparison List</CCardHeader>
          <CCardBody>
            <StandardGrid
              dataSource={items}
              keyExpr="id"
              noDataText="No entries yet — fill in the values above and click Add to List."
            >
              <Paging defaultPageSize={10} />
              <Pager showPageSizeSelector showInfo allowedPageSizes={[10, 25, 50]} />

              <Column
                dataField="initialValue"
                caption="Initial Value"
                format={{ type: 'fixedPoint', precision: 0 }}
              />
              <Column
                dataField="finalValue"
                caption="Final Value"
                format={{ type: 'fixedPoint', precision: 0 }}
              />
              <Column
                dataField="diff"
                caption="Diff"
                cellRender={({ value }) => (
                  <span style={{ color: value >= 0 ? '#2eb85c' : '#e55353', fontWeight: 600 }}>
                    {formatToCOP(value)}
                  </span>
                )}
              />
              <Column
                dataField="increaseValue"
                caption="Increase %"
                cellRender={({ value }) =>
                  value != null ? (
                    <span style={{ color: '#2eb85c', fontWeight: 600 }}>{formatPct(value)}</span>
                  ) : (
                    <span className="text-medium-emphasis">—</span>
                  )
                }
              />
              <Column
                dataField="decreaseValue"
                caption="Decrease %"
                cellRender={({ value }) =>
                  value != null ? (
                    <span style={{ color: '#e55353', fontWeight: 600 }}>{formatPct(value)}</span>
                  ) : (
                    <span className="text-medium-emphasis">—</span>
                  )
                }
              />
              <Column
                dataField="inversionValue"
                caption="Investment"
                format={{ type: 'fixedPoint', precision: 0 }}
              />
              <Column
                dataField="profit"
                caption="Profit %"
                cellRender={({ value }) =>
                  value != null ? (
                    <span style={{ color: '#2eb85c', fontWeight: 600 }}>{formatPct(value)}</span>
                  ) : (
                    <span className="text-medium-emphasis">—</span>
                  )
                }
              />
              <Column
                dataField="loss"
                caption="Loss %"
                cellRender={({ value }) =>
                  value != null ? (
                    <span style={{ color: '#e55353', fontWeight: 600 }}>{formatPct(value)}</span>
                  ) : (
                    <span className="text-medium-emphasis">—</span>
                  )
                }
              />
              <Column
                caption="Actions"
                width={80}
                alignment="center"
                cellRender={({ data }) => (
                  <CButton
                    color="danger"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(data.id)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                )}
              />
            </StandardGrid>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default IncreaseDecrease
