import React from 'react'
import { CCardImage, CSpinner } from '@coreui/react'

function VaucherControlViewer({ payment }) {
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
      <center>
        <br />
        N/D
      </center>
    )
  }

  return <CCardImage key={crypto.randomUUID()} orientation="top" src={vaucher} />
}

export { VaucherControlViewer }
