import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCopy, cilGrid, cilList } from '@coreui/icons'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow } from 'devextreme-react/data-grid'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/designActions'
import { DESIGN_TEMPLATE_MAP } from 'src/constants/inmobiliaria'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './Designs.scss'

const Designs = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const activeTenantId = useActiveTenantId()
  const { list, fetching } = useSelector((s) => s.inmobiliariaDesign)
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch, activeTenantId])

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.name}"?`)) {
      dispatch(actions.deleteRequest({ id: row.id }))
    }
  }

  const handleClone = (row) => {
    const name = window.prompt('Nombre del nuevo diseño:', `${row.name} (copia)`)
    if (!name?.trim()) return
    dispatch(actions.cloneRequest({ id: row.id, name: name.trim() }))
  }

  const templateDef = (row) => DESIGN_TEMPLATE_MAP[row.template ?? 'orange']

  return (
    <div className="im-designs">
      <div className="im-designs__toolbar">
        <h5 style={{ margin: 0 }}>Diseños de panfletos</h5>
        <div style={{ display: 'flex', gap: 8 }}>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            title={viewMode === 'grid' ? 'Ver como tarjetas' : 'Ver como tabla'}
            onClick={() => setViewMode((v) => (v === 'grid' ? 'card' : 'grid'))}
          >
            <CIcon icon={viewMode === 'grid' ? cilList : cilGrid} className="me-1" />
            Modo
          </CButton>
          <CButton color="primary" size="sm" onClick={() => navigate('/inmobiliaria/designs/new')}>
            <CIcon icon={cilPlus} className="me-1" />
            Nuevo diseño
          </CButton>
        </div>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : viewMode === 'grid' ? (
        <StandardGrid dataSource={list ?? []} keyExpr="id">
          <FilterRow visible />
          <Paging defaultPageSize={15} />
          <Column dataField="name" caption="Nombre" />
          <Column dataField="neighborhood" caption="Barrio" />
          <Column dataField="rentAmount" caption="Canon" width={130} />
          <Column dataField="phone" caption="Teléfono" width={160} />
          <Column
            dataField="template"
            caption="Plantilla"
            width={140}
            cellRender={({ data }) => {
              const def = templateDef(data)
              return (
                <span className="im-designs__template-pill" data-tpl={data.template ?? 'orange'}>
                  {def?.label ?? '🟠 Naranja'}
                </span>
              )
            }}
          />
          <Column
            caption="Acciones"
            width={120}
            cellRender={({ data }) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <CButton
                  size="sm"
                  color="primary"
                  variant="ghost"
                  title="Editar"
                  onClick={() => navigate(`/inmobiliaria/designs/${data.id}`)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  size="sm"
                  color="info"
                  variant="ghost"
                  title="Clonar"
                  onClick={() => handleClone(data)}
                >
                  <CIcon icon={cilCopy} />
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  title="Eliminar"
                  onClick={() => handleDelete(data)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </div>
            )}
          />
        </StandardGrid>
      ) : (
        <StandardCard
          data={list ?? []}
          keyExpr="id"
          emptyText="Sin diseños."
          renderTitle={(d) => d.name}
          renderValue={(d) => d.rentAmount}
          renderBadge={(d) => ({
            label: templateDef(d)?.label ?? '🟠 Naranja',
            variant: templateDef(d)?.badgeVariant ?? 'warning',
            onClick: () => navigate(`/inmobiliaria/designs/${d.id}`),
          })}
          renderRows={(d) => [
            [
              d.neighborhood && (
                <>
                  <span className={SC.label}>Barrio </span>
                  {d.neighborhood}
                </>
              ),
              d.phone && (
                <>
                  <span className={SC.label}>Tel </span>
                  {d.phone}
                </>
              ),
            ],
          ]}
          renderActions={(d) => [
            {
              icon: cilPencil,
              color: 'primary',
              title: 'Editar',
              onClick: () => navigate(`/inmobiliaria/designs/${d.id}`),
            },
            { icon: cilCopy, color: 'info', title: 'Clonar', onClick: () => handleClone(d) },
            {
              icon: cilTrash,
              color: 'danger',
              title: 'Eliminar',
              onClick: () => handleDelete(d),
            },
          ]}
        />
      )}
    </div>
  )
}

export default Designs
