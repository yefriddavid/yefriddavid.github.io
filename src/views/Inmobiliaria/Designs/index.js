import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow } from 'devextreme-react/data-grid'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/designActions'
import './Designs.scss'

const Designs = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, fetching } = useSelector((s) => s.inmobiliariaDesign)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

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

  return (
    <div className="im-designs">
      <div className="im-designs__toolbar">
        <h5 style={{ margin: 0 }}>Diseños de panfletos</h5>
        <CButton color="primary" size="sm" onClick={() => navigate('/inmobiliaria/designs/new')}>
          <CIcon icon={cilPlus} className="me-1" />
          Nuevo diseño
        </CButton>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : (
        <StandardGrid dataSource={list ?? []} keyExpr="id">
          <FilterRow visible />
          <Paging defaultPageSize={15} />
          <Column dataField="name" caption="Nombre" />
          <Column dataField="neighborhood" caption="Barrio" />
          <Column dataField="rentAmount" caption="Canon" width={130} />
          <Column dataField="phone" caption="Teléfono" width={160} />
          <Column
            caption="Acciones"
            width={130}
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
      )}
    </div>
  )
}

export default Designs
