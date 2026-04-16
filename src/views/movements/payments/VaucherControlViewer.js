import React from 'react'
import { useTranslation } from 'react-i18next'
import { CCardImage, CSpinner } from '@coreui/react'

function VaucherControlViewer({ payment }) {
  const { t } = useTranslation()
  const { vaucher } = payment

  if (vaucher === false) {
    return (
      <center>
        <br />
        <CSpinner color="info" />
      </center>
    )
  }

  if (vaucher === '') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 120,
          background: '#f1f3f5',
          color: '#adb5bd',
          gap: 8,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
        </svg>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {t('voucher.noVoucher')}
        </span>
      </div>
    )
  }

  return <CCardImage key={crypto.randomUUID()} orientation="top" src={vaucher} />
}

export { VaucherControlViewer }
