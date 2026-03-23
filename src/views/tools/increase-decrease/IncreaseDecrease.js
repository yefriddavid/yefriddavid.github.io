import React from 'react'
import { CToast, CToastBody, CToastHeader } from '@coreui/react'
import { useState } from 'react'
import { CCol, CFormInput, CRow } from '@coreui/react'

const items = [];

const IncreaseDecrease = () => {
  const [initialValue, setInitialValue] = useState(107500)
  const [finalValue, setFinalValue] = useState(111490)
  let [increaseValue, setIncreaseValue] = useState('')
  const [decreaseValue, setDecreaseValue] = useState('')
  const [inversionValue, setInversionValue] = useState(500)
  let [inversionIncreaseValue, setInversionIncreaseValue] = useState('')

  const diff = finalValue - initialValue

  increaseValue = diff / initialValue * 100

  inversionIncreaseValue = inversionValue * increaseValue / 100

  const newItem = ItemRow({initialValue, finalValue, increaseValue, decreaseValue, inversionValue, inversionIncreaseValue})
  items.push(newItem)

  return (
    <>
    Valor Inicial: <input value={initialValue} onChange={(e) => setInitialValue(e.target.value)} type="number" /> <br />
    Valor Final: <input value={finalValue} onChange={(e) => setFinalValue(e.target.value)} type="number" /> <br />
    Increase %: <input value={increaseValue} onChange={(e) => setIncreaseValue(e.target.value)} type="number" /> <br />
    Decraese %: <input value={decreaseValue} onChange={(e) => setDecreaseValue(e.target.value)} type="number" /> <br />

    Valor Inversion: <input value={inversionValue} onChange={(e) => setInversionValue(e.target.value)} type="number" /> <br />

    Inversion Increase: <input value={inversionIncreaseValue} onChange={(e) => setDecreaseValue(e.target.value)} type="number" />
    earn cop: {formatToCOP(inversionIncreaseValue * 4000 )} <br />
    Inversion Decrease: <input /><br />

    Diff: { diff }
    <br />
    <button>
      Add
    </button>

      <CRow>
        <CCol xs>
          initial Value
        </CCol>
        <CCol xs>
          Final Value
        </CCol>
        <CCol xs>
          Increase %
        </CCol>
        <CCol xs>
          decrease %
        </CCol>
        <CCol xs>
          Valor Inversion
        </CCol>
        <CCol xs>
          Profit
        </CCol>
        <CCol xs>
          Perdidas
        </CCol>
        <CCol xs>
          Actions
        </CCol>
      </CRow>
    {items}

    {/*<CRow>
        <CCol xs>
          <CFormInput value={initialValue} placeholder="Initial Value" aria-label="First name" />
        </CCol>
        <CCol xs>
          <CFormInput value={finalValue} placeholder="Final Value" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={increaseValue} placeholder="Increase %" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={decreaseValue} placeholder="Decrease %" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={inversionValue} placeholder="Valor Inversion %" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={inversionIncreaseValue} placeholder="Profit %" aria-label="Profit" />
        </CCol>
        <CCol xs>
          <CFormInput placeholder="Perdida %" aria-label="Last name" />
        </CCol>
      </CRow>*/}

    </>
  )
}




const ItemRow = ({initialValue, finalValue,increaseValue,decreaseValue, inversionValue,inversionIncreaseValue}) => {

  return (

      <CRow>
        <CCol xs>
          <CFormInput value={initialValue} placeholder="Initial Value" aria-label="First name" />
        </CCol>
        <CCol xs>
          <CFormInput value={finalValue} placeholder="Final Value" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={increaseValue} placeholder="Increase %" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={decreaseValue} placeholder="Decrease %" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={inversionValue} placeholder="Valor Inversion %" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <CFormInput value={inversionIncreaseValue} placeholder="Profit %" aria-label="Profit" />
        </CCol>
        <CCol xs>
          <CFormInput placeholder="Perdida %" aria-label="Last name" />
        </CCol>
        <CCol xs>
          <button>
          Delete
          </button>
        </CCol>
      </CRow>
  )
}


  const formatToCOP = (value) => {
    if (!value || isNaN(value)) return '';

    const num = parseFloat(value);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

export default IncreaseDecrease
