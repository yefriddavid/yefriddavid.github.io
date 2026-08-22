import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  FeatherGrid,
  FeatherSortHead,
  FeatherColumnToggle,
  useFeatherSort,
  useFeatherColumns,
  sortFeatherRows,
} from 'src/components/shared/FeatherGrid'
import { CCard, CCardHeader, CCardBody, CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilPencil, cilDescription, cilUser } from '@coreui/icons'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import { fmt } from 'src/utils/formatters'
import StatusBadge from 'src/components/shared/StatusBadge'
import useIsMobile from 'src/hooks/useIsMobile'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './masters.scss'
import Spinner from 'src/components/shared/Spinner'

const Conductores = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const activeTenantId = useActiveTenantId()
  const { data: records, fetching } = useSelector((s) => s.taxiDriver)
  const { data: vehicles } = useSelector((s) => s.taxiVehicle)
  const [sort, toggleSort] = useFeatherSort([{ key: 'name', dir: 'asc' }])

  const DRIVER_COLUMNS = useMemo(
    () => [
      { key: 'name', label: t('taxis.drivers.fields.name') },
      { key: 'idNumber', label: t('taxis.drivers.fields.idNumber') },
      { key: 'phone', label: t('taxis.drivers.fields.phone') },
      { key: 'defaultAmount', label: t('taxis.drivers.fields.defaultAmount'), align: 'num' },
      {
        key: 'defaultAmountSunday',
        label: t('taxis.drivers.fields.defaultAmountSunday'),
        align: 'num',
      },
      { key: 'defaultVehicle', label: t('taxis.drivers.fields.defaultVehicle') },
      { key: 'comment', label: 'Comentario' },
      { key: 'active', label: 'Estado' },
    ],
    [t],
  )

  const {
    isVisible: isDriverColVisible,
    selected: driverColSelected,
    toggle: toggleDriverCol,
    clear: clearDriverCols,
  } = useFeatherColumns(DRIVER_COLUMNS)

  useEffect(() => {
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
  }, [dispatch, activeTenantId])

  const handleEdit = (row) => navigate(`/taxis/drivers/${row.id}`)

  const handleToggleActive = (driver) => {
    dispatch(taxiDriverActions.updateRequest({ ...driver, active: !(driver.active !== false) }))
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este conductor?')) return
    dispatch(taxiDriverActions.deleteRequest({ id }))
  }

  const rows = records ?? []

  const sortedRows = useMemo(() => sortFeatherRows(rows, sort), [rows, sort])

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <strong>Conductores</strong>
          <CBadge color="secondary">{rows.length}</CBadge>
        </div>
        <div className="d-flex align-items-center gap-2">
          {!isMobile && (
            <FeatherColumnToggle
              columns={DRIVER_COLUMNS}
              selected={driverColSelected}
              onToggle={toggleDriverCol}
              onClearAll={clearDriverCols}
            />
          )}
          <CButton
            size="sm"
            color="primary"
            variant="outline"
            onClick={() => navigate('/taxis/drivers/new')}
          >
            <CIcon icon={cilPlus} size="sm" /> Nuevo conductor
          </CButton>
        </div>
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
          <FeatherGrid className="master-grid-scroll">
            <colgroup>
              <col />
              <col />
              {DRIVER_COLUMNS.map((col) => (
                <col
                  key={col.key}
                  style={{ visibility: isDriverColVisible(col.key) ? undefined : 'collapse' }}
                />
              ))}
            </colgroup>
            <FeatherSortHead
              columns={DRIVER_COLUMNS}
              sort={sort}
              onSort={toggleSort}
              leading={
                <>
                  <th>Acciones</th>
                  <th>👤</th>
                </>
              }
            />
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="master-empty">
                    Sin conductores aún.
                  </td>
                </tr>
              ) : (
                sortedRows.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="master-actions">
                        <button
                          className="master-btn master-btn--primary"
                          onClick={() => handleEdit(d)}
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          className="master-btn master-btn--danger"
                          onClick={() => handleDelete(d.id)}
                          title="Eliminar"
                        >
                          <CIcon icon={cilTrash} size="sm" />
                        </button>
                      </div>
                    </td>
                    <td>
                      {d.photo ? (
                        <img src={d.photo} alt="" className="master-photo-thumb" />
                      ) : (
                        <span className="master-photo-thumb master-photo-thumb--empty">
                          <CIcon icon={cilUser} size="sm" />
                        </span>
                      )}
                    </td>
                    <td>{d.name}</td>
                    <td className="master-mono">{d.idNumber}</td>
                    <td>{d.phone}</td>
                    <td className="num">
                      <span className="master-amount">
                        {d.defaultAmount ? fmt(d.defaultAmount) : '—'}
                      </span>
                    </td>
                    <td className="num">
                      <span className="master-amount">
                        {d.defaultAmountSunday ? fmt(d.defaultAmountSunday) : '—'}
                      </span>
                    </td>
                    <td className="master-mono">{d.defaultVehicle || '—'}</td>
                    <td>{d.comment}</td>
                    <td>
                      <StatusBadge
                        active={d.active !== false}
                        onClick={() => handleToggleActive(d)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </FeatherGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Conductores
