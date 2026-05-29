import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow } from 'devextreme-react/data-grid'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/finance/picturesActions'
import { PICTURES_UNITS_MAP } from 'src/constants/finance'

const Pictures = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, fetching, saving } = useSelector((s) => s.financePictures)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.name}"?`)) {
      dispatch(actions.deleteRequest({ id: row.id }))
    }
  }

  const handleDuplicate = (row) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = row
    dispatch(actions.createRequest({ ...rest, name: `${row.name} (copia)` }))
  }

  const sizeLabel = (row) => {
    const u = PICTURES_UNITS_MAP[row.canvas?.unit] ?? PICTURES_UNITS_MAP.cm
    return `${row.canvas?.width ?? '?'} × ${row.canvas?.height ?? '?'} ${u.label}`
  }

  return (
    <div className="pic-list">
      <div className="pic-list__header">
        <h5 className="pic-list__title">Pictures</h5>
        <CButton
          color="primary"
          size="sm"
          disabled={saving}
          onClick={() => navigate('/finance/pictures/new')}
        >
          <CIcon icon={cilPlus} className="me-1" />
          Nuevo cuadro
        </CButton>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : (
        <StandardGrid dataSource={list ?? []} keyExpr="id">
          <FilterRow visible />
          <Paging defaultPageSize={25} />
          <Column dataField="name" caption="Nombre" />
          <Column caption="Tamaño" width={180} cellRender={({ data }) => sizeLabel(data)} />
          <Column
            caption="Figuras"
            width={90}
            alignment="center"
            cellRender={({ data }) => data.nodes?.length ?? 0}
          />
          <Column
            caption="Grupos"
            width={90}
            alignment="center"
            cellRender={({ data }) => data.groups?.length ?? 0}
          />
          <Column dataField="updatedAt" caption="Última edición" dataType="date" width={160} />
          <Column
            caption="Acciones"
            width={110}
            cellRender={({ data }) => (
              <div style={{ display: 'flex', gap: 4 }}>
                <CButton
                  size="sm"
                  color="primary"
                  variant="ghost"
                  title="Editar"
                  onClick={() => navigate(`/finance/pictures/${data.id}`)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  size="sm"
                  color="info"
                  variant="ghost"
                  title="Duplicar"
                  onClick={() => handleDuplicate(data)}
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

export default Pictures
