import React from 'react'
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react'

const GridTopControls = ({
  currentPrice,
  setCurrentPrice,
  loanRate,
  onLoanRateChange,
  gridStep,
  setGridStep,
}) => (
  <div
    style={{
      padding: '20px',
      background: '#161b22',
      borderRadius: '12px',
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      alignItems: 'center',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        gap: '12px',
        justifyContent: 'center',
      }}
    >
      <CInputGroup style={{ flex: '1 1 180px', minWidth: 0 }}>
        <CInputGroupText
          style={{
            background: '#00ffff',
            color: '#000',
            fontWeight: 'bold',
            border: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          PRECIO ACTUAL
        </CInputGroupText>
        <CFormInput
          type="number"
          value={currentPrice}
          onChange={(e) => {
            const v = Number(e.target.value)
            setCurrentPrice(v)
            localStorage.setItem('cgt.currentPrice', v)
          }}
          style={{
            background: '#0d1117',
            color: '#00ffff',
            border: '2px solid #00ffff',
            fontWeight: 'bold',
            minWidth: 0,
          }}
        />
      </CInputGroup>

      <CInputGroup style={{ flex: '1 1 150px', minWidth: 0 }}>
        <CInputGroupText
          style={{
            background: '#fbbf24',
            color: '#000',
            fontWeight: 'bold',
            border: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          % PRÉSTAMO
        </CInputGroupText>
        <CFormInput
          type="number"
          step="0.1"
          value={loanRate}
          onChange={(e) => onLoanRateChange?.(Number(e.target.value))}
          style={{
            background: '#0d1117',
            color: '#fbbf24',
            border: '2px solid #fbbf24',
            fontWeight: 'bold',
            minWidth: 0,
          }}
        />
      </CInputGroup>

      <CInputGroup style={{ flex: '1 1 180px', minWidth: 0 }}>
        <CInputGroupText
          style={{
            background: '#a78bfa',
            color: '#000',
            fontWeight: 'bold',
            border: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          PASO GRID
        </CInputGroupText>
        <CInputGroupText
          as="button"
          onClick={() => setGridStep((v) => Math.max(1, v - 1000))}
          style={{
            background: '#1e1b4b',
            color: '#a78bfa',
            fontWeight: 'bold',
            border: '2px solid #a78bfa',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          −
        </CInputGroupText>
        <CFormInput
          type="number"
          min="1"
          step="any"
          value={gridStep}
          onChange={(e) => setGridStep(Number(e.target.value))}
          style={{
            background: '#0d1117',
            color: '#a78bfa',
            border: '2px solid #a78bfa',
            fontWeight: 'bold',
            textAlign: 'center',
            minWidth: 0,
          }}
        />
        <CInputGroupText
          as="button"
          onClick={() => setGridStep((v) => v + 1000)}
          style={{
            background: '#1e1b4b',
            color: '#a78bfa',
            fontWeight: 'bold',
            border: '2px solid #a78bfa',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          +
        </CInputGroupText>
      </CInputGroup>
    </div>
  </div>
)

export default GridTopControls
