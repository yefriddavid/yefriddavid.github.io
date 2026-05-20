import React from 'react'
import { CCardImage } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'

function VaucherControlViewer({ payment }) {
  const { vaucher } = payment

  if (vaucher === false) {
    return (
      <center>
        <br />
        <Spinner color="info" />
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
