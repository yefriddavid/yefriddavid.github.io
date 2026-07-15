import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilDescription } from '@coreui/icons'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import Spinner from 'src/components/shared/Spinner'
import DriverForm, { EMPTY } from './DriverForm'
import DriverGenDocsPanel from './DriverGenDocsPanel'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './masters.scss'

const DriverEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const isNew = !id
  const [tab, setTab] = useState('datos')

  const { data: records, fetching } = useSelector((s) => s.taxiDriver)
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)

  useEffect(() => {
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch, activeTenantId])

  const driver = isNew ? null : (records ?? []).find((d) => d.id === id)

  const goBack = () => navigate('/taxis/drivers')

  const handleSave = (form) => {
    if (isNew) {
      dispatch(taxiDriverActions.createRequest(form))
    } else {
      dispatch(taxiDriverActions.updateRequest({ id, ...form }))
    }
    goBack()
  }

  if (!isNew && fetching && !driver) return <Spinner mode="section" />
  if (!isNew && !fetching && !driver) return null

  return (
    <CCard>
      <CCardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <CButton color="secondary" variant="ghost" size="sm" onClick={goBack}>
            <CIcon icon={cilArrowLeft} className="me-1" />
            Volver
          </CButton>
          <h5 style={{ margin: 0 }}>
            {isNew ? 'Nuevo conductor' : `Editando: ${driver?.name ?? ''}`}
          </h5>
        </div>

        {!isNew && (
          <div className="master-detail-tabs">
            <button
              className={`master-detail-tab${tab === 'datos' ? ' master-detail-tab--active' : ''}`}
              onClick={() => setTab('datos')}
            >
              Datos
            </button>
            <button
              className={`master-detail-tab${tab === 'documentos' ? ' master-detail-tab--active' : ''}`}
              onClick={() => setTab('documentos')}
            >
              <CIcon icon={cilDescription} size="sm" /> Documentos
            </button>
          </div>
        )}

        {tab === 'datos' || isNew ? (
          <DriverForm
            key={driver?.id ?? 'new'}
            initial={isNew ? EMPTY : driver}
            vehicles={vehicles}
            title={isNew ? 'Nuevo conductor' : 'Editar conductor'}
            subtitle={isNew ? undefined : driver?.name}
            onSave={handleSave}
            onCancel={goBack}
            saving={fetching}
          />
        ) : (
          <DriverGenDocsPanel driver={driver} isMobile={false} />
        )}
      </CCardBody>
    </CCard>
  )
}

export default DriverEditor
