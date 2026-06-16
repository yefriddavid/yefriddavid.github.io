import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow } from 'devextreme-react/data-grid'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/planosActions'
import './Planos.scss'

const Planos = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, fetching } = useSelector((s) => s.inmobiliariaPlanos)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleClone = (row) => {
    dispatch(actions.cloneRequest({ id: row.id }))
  }

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.name}"?`)) {
      dispatch(actions.deleteRequest({ id: row.id }))
    }
  }

  const wallCount = (row) => row.walls?.length ?? 0
  const furnitureCount = (row) => row.furniture?.length ?? 0

  return (
    <div className="im-planos">
      <div className="im-planos__header">
        <h5 className="im-planos__title">Planos</h5>
        <CButton color="primary" size="sm" onClick={() => navigate('/inmobiliaria/planos/new')}>
          <CIcon icon={cilPlus} className="me-1" />
          Nuevo plano
        </CButton>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : (
        <StandardGrid dataSource={list ?? []} keyExpr="id">
          <FilterRow visible />
          <Paging defaultPageSize={20} />
          <Column dataField="name" caption="Nombre" />
          <Column
            caption="Paredes"
            width={100}
            alignment="center"
            cellRender={({ data }) => wallCount(data)}
          />
          <Column
            caption="Muebles"
            width={100}
            alignment="center"
            cellRender={({ data }) => furnitureCount(data)}
          />
          <Column dataField="updatedAt" caption="Última edición" dataType="date" width={160} />
          <Column
            caption="Acciones"
            width={130}
            cellRender={({ data }) => (
              <div style={{ display: 'flex', gap: 4 }}>
                <CButton
                  size="sm"
                  color="primary"
                  variant="ghost"
                  title="Editar"
                  onClick={() => navigate(`/inmobiliaria/planos/${data.id}`)}
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
      )}
    </div>
  )
}

export default Planos
