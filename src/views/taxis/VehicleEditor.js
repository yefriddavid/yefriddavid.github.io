import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft } from '@coreui/icons'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import Spinner from 'src/components/shared/Spinner'
import VehicleForm, { EMPTY } from './VehicleForm'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './masters.scss'

const VehicleEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const isNew = !id

  const { data: records, fetching } = useSelector((s) => s.taxiVehicle)

  useEffect(() => {
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch, activeTenantId])

  const vehicle = isNew ? null : (records ?? []).find((v) => v.id === id)

  const goBack = () => navigate('/taxis/vehicles')

  const handleSave = (form) => {
    if (isNew) {
      dispatch(taxiVehicleActions.createRequest(form))
    } else {
      dispatch(taxiVehicleActions.updateRequest({ id, ...form }))
    }
    goBack()
  }

  if (!isNew && fetching && !vehicle) return <Spinner mode="section" />
  if (!isNew && !fetching && !vehicle) return null

  return (
    <CCard>
      <CCardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <CButton color="secondary" variant="ghost" size="sm" onClick={goBack}>
            <CIcon icon={cilArrowLeft} className="me-1" />
            Volver
          </CButton>
          <h5 style={{ margin: 0 }}>
            {isNew ? 'Nuevo vehículo' : `Editando: ${vehicle?.plate ?? ''}`}
          </h5>
        </div>

        <VehicleForm
          key={vehicle?.id ?? 'new'}
          initial={isNew ? EMPTY : vehicle}
          title={isNew ? 'Nuevo vehículo' : 'Editar vehículo'}
          subtitle={isNew ? undefined : vehicle?.plate}
          onSave={handleSave}
          onCancel={goBack}
          saving={fetching}
        />
      </CCardBody>
    </CCard>
  )
}

export default VehicleEditor
