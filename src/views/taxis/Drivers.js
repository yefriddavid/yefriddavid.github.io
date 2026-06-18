import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Column, Lookup } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { CCard, CCardHeader, CCardBody, CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilPencil, cilDescription } from '@coreui/icons'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import { fmt } from 'src/utils/formatters'
import StatusBadge from 'src/components/shared/StatusBadge'
import useIsMobile from 'src/hooks/useIsMobile'
import './masters.scss'
import Spinner from 'src/components/shared/Spinner'

const Conductores = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { data: records, fetching } = useSelector((s) => s.taxiDriver)
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)

  useEffect(() => {
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch])

  const vehicleOptions = [
    { plate: '', label: '— Ninguno —' },
    ...(vehicles ?? []).map((v) => ({
      plate: v.plate,
      label: `${v.plate}${v.brand ? ` · ${v.brand}` : ''}${v.active === false ? ' (Inactivo)' : ''}`,
    })),
  ]

  const handleEdit = (row) => navigate(`/taxis/drivers/${row.id}`)

  const handleToggleActive = (driver) => {
    dispatch(taxiDriverActions.updateRequest({ ...driver, active: !(driver.active !== false) }))
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este conductor?')) return
    dispatch(taxiDriverActions.deleteRequest({ id }))
  }

  const rows = records ?? []

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <strong>Conductores</strong>
          <CBadge color="secondary">{rows.length}</CBadge>
        </div>
        <CButton
          size="sm"
          color="primary"
          variant="outline"
          onClick={() => navigate('/taxis/drivers/new')}
        >
          <CIcon icon={cilPlus} size="sm" /> Nuevo conductor
        </CButton>
      </CCardHeader>

      <CCardBody>
        {fetching && !records ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner color="primary" />
          </div>
        ) : isMobile ? (
          <StandardList
            data={rows}
            keyExpr="id"
            emptyText="Sin conductores aún."
            inactive={(d) => d.active === false}
            renderTitle={(d) => d.name}
            renderBadge={(d) => ({
              label: d.active !== false ? 'Activo' : 'Inactivo',
              variant: d.active !== false ? 'active' : 'inactive',
              onClick: () => handleToggleActive(d),
            })}
            renderRows={(d) => {
              const v = (vehicles ?? []).find((veh) => veh.plate === d.defaultVehicle)
              return [
                [
                  d.idNumber && `CC ${d.idNumber}`,
                  d.phone && (
                    <>
                      <span className={SL.label}>Cel </span>
                      {d.phone}
                    </>
                  ),
                ],
                [
                  (v?.plate ?? d.defaultVehicle) && (
                    <span className={SL.mono}>{v?.plate ?? d.defaultVehicle}</span>
                  ),
                  v?.brand && <span className={SL.muted}>{v.brand}</span>,
                ],
                [
                  d.defaultAmount > 0 && (
                    <>
                      <span className={SL.label}>Liq </span>
                      {fmt(d.defaultAmount)}
                    </>
                  ),
                  d.defaultAmountSunday > 0 && (
                    <>
                      <span className={SL.label}>Dom </span>
                      {fmt(d.defaultAmountSunday)}
                    </>
                  ),
                ],
              ]
            }}
            renderActions={(d) => [
              { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => handleEdit(d) },
              {
                icon: cilDescription,
                color: 'info',
                title: 'Documentos',
                onClick: () => handleEdit(d),
              },
              {
                icon: cilTrash,
                color: 'danger',
                title: 'Eliminar',
                onClick: () => handleDelete(d.id),
              },
            ]}
          />
        ) : (
          <StandardGrid keyExpr="id" dataSource={rows} noDataText="Sin conductores aún.">
            <Column
              caption=""
              width={70}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ data }) => (
                <div className="master-actions">
                  <button
                    className="master-btn master-btn--primary"
                    onClick={() => handleEdit(data)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className="master-btn master-btn--danger"
                    onClick={() => handleDelete(data.id)}
                    title="Eliminar"
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                </div>
              )}
            />
            <Column
              dataField="photo"
              caption=""
              width={48}
              allowSorting={false}
              allowResizing={false}
              cellRender={({ value }) =>
                value ? (
                  <img src={value} alt="" className="master-photo-thumb" />
                ) : (
                  <span className="master-photo-thumb master-photo-thumb--empty">–</span>
                )
              }
            />
            <Column dataField="name" caption={t('taxis.drivers.fields.name')} minWidth={150} />
            <Column
              dataField="idNumber"
              caption={t('taxis.drivers.fields.idNumber')}
              width={130}
              cellRender={({ value }) => <span className="master-mono">{value}</span>}
            />
            <Column
              dataField="phone"
              caption={t('taxis.drivers.fields.phone')}
              width={130}
              hidingPriority={1}
            />
            <Column
              dataField="defaultAmount"
              caption={t('taxis.drivers.fields.defaultAmount')}
              dataType="number"
              width={130}
              hidingPriority={2}
              cellRender={({ value }) => (
                <span className="master-amount">{value ? fmt(value) : '—'}</span>
              )}
            />
            <Column
              dataField="defaultAmountSunday"
              caption={t('taxis.drivers.fields.defaultAmountSunday')}
              dataType="number"
              width={130}
              hidingPriority={3}
              cellRender={({ value }) => (
                <span className="master-amount">{value ? fmt(value) : '—'}</span>
              )}
            />
            <Column
              dataField="defaultVehicle"
              caption={t('taxis.drivers.fields.defaultVehicle')}
              width={150}
              hidingPriority={4}
              cellRender={({ value }) => <span className="master-mono">{value || '—'}</span>}
            >
              <Lookup dataSource={vehicleOptions} valueExpr="plate" displayExpr="label" />
            </Column>
            <Column dataField="comment" caption="Comentario" minWidth={160} hidingPriority={5} />
            <Column
              dataField="active"
              caption="Estado"
              width={100}
              allowSorting={true}
              cellRender={({ data }) => <StatusBadge active={data.active !== false} />}
            />
          </StandardGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Conductores
