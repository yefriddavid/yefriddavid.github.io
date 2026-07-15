import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow } from 'devextreme-react/data-grid'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/finance/scenes3dActions'
import useActiveTenantId from 'src/hooks/useActiveTenantId'

const Scenes3D = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const activeTenantId = useActiveTenantId()
  const { list, fetching, saving } = useSelector((s) => s.financeScenes3d)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch, activeTenantId])

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.name}"?`)) {
      dispatch(actions.deleteRequest({ id: row.id }))
    }
  }

  const handleDuplicate = (row) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = row
    dispatch(actions.createRequest({ ...rest, name: `${row.name} (copia)` }))
  }

  return (
    <div className="s3d-list">
      <div className="s3d-list__header">
        <h5 className="s3d-list__title">Escenas 3D</h5>
        <CButton
          color="primary"
          size="sm"
          disabled={saving}
          onClick={() => navigate('/miscelanea/scenes3d/new')}
        >
          <CIcon icon={cilPlus} className="me-1" />
          Nueva escena
        </CButton>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : (
        <StandardGrid dataSource={list ?? []} keyExpr="id">
          <FilterRow visible />
          <Paging defaultPageSize={25} />
          <Column dataField="name" caption="Nombre" />
          <Column
            caption="Objetos"
            width={100}
            alignment="center"
            cellRender={({ data }) => data.objects?.length ?? 0}
          />
          <Column dataField="updatedAt" caption="Última edición" dataType="date" width={160} />
          <Column
            caption="Acciones"
            width={110}
            cellRender={({ data }) => (
              <div style={{ display: 'flex', gap: 4 }}>
                <CButton
                  size="sm" color="primary" variant="ghost" title="Editar"
                  onClick={() => navigate(`/miscelanea/scenes3d/${data.id}`)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  size="sm" color="info" variant="ghost" title="Duplicar"
                  onClick={() => handleDuplicate(data)}
                >
                  <CIcon icon={cilCopy} />
                </CButton>
                <CButton
                  size="sm" color="danger" variant="ghost" title="Eliminar"
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

export default Scenes3D
