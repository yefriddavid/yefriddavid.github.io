import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import { CCard, CCardHeader, CCardBody, CBadge, CAlert, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilList, cilGrid } from '@coreui/icons'
import * as usersActions from 'src/actions/usersActions'
import {
  USER_ROLE_LABELS as ROLE_LABELS,
  USER_ROLE_COLORS as ROLE_COLORS,
} from 'src/constants/admin'
import Spinner from 'src/components/shared/Spinner'
import StatusBadge from 'src/components/shared/StatusBadge'

const RoleBadge = ({ role }) => (
  <CBadge color={ROLE_COLORS[role] ?? 'secondary'}>{ROLE_LABELS[role] ?? role}</CBadge>
)

const Users = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data, fetching, isError, error } = useSelector((s) => s.users)
  const profile = useSelector((s) => s.profile.data)
  const isSuperAdmin = profile?.role === 'superAdmin'
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    dispatch(usersActions.fetchRequest())
  }, [dispatch])

  const toEdit = (username) => navigate(`${pathname}/${username}`)

  const handleToggleActive = (row) => {
    dispatch(usersActions.updateRequest({ ...row, active: !(row.active !== false) }))
  }

  const handleDelete = (row) => {
    if (!window.confirm(`¿Eliminar usuario "${row.username}"?`)) return
    dispatch(usersActions.deleteRequest({ username: row.username }))
  }

  const listActions = (row) =>
    isSuperAdmin
      ? [
          {
            icon: cilPencil,
            color: 'primary',
            title: 'Editar',
            onClick: () => toEdit(row.username),
          },
          {
            label: 'Reset pw',
            color: 'warning',
            title: 'Reset contraseña',
            onClick: () => toEdit(row.username),
          },
          { icon: cilTrash, color: 'danger', title: 'Eliminar', onClick: () => handleDelete(row) },
        ]
      : []

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <strong>Usuarios</strong>
        {fetching && <Spinner size="sm" />}
        <div className="ms-auto d-flex gap-2">
          <CButton
            size="sm"
            color="secondary"
            variant={viewMode === 'list' ? 'outline' : 'ghost'}
            title="Vista lista"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <CIcon icon={viewMode === 'grid' ? cilList : cilGrid} />
          </CButton>
          {isSuperAdmin && (
            <CButton size="sm" color="primary" onClick={() => toEdit('new')}>
              <CIcon icon={cilPlus} /> Nuevo usuario
            </CButton>
          )}
        </div>
      </CCardHeader>
      <CCardBody className="p-0">
        {isError && (
          <CAlert color="danger" className="m-3">
            {String(error)}
          </CAlert>
        )}

        {viewMode === 'list' ? (
          <StandardList
            data={[...(data ?? [])].sort((a, b) => a.username.localeCompare(b.username))}
            keyExpr="username"
            emptyText={fetching ? 'Cargando...' : 'Sin usuarios registrados.'}
            inactive={(u) => u.active === false}
            renderTitle={(u) => u.username}
            renderBadge={(u) => ({
              label: ROLE_LABELS[u.role] ?? u.role,
              variant:
                u.role === 'superAdmin' ? 'active' : u.role === 'manager' ? 'info' : 'default',
            })}
            renderRows={(u) => [
              [
                u.name && <span>{u.name}</span>,
                u.email && (
                  <>
                    <span className={SL.label}>@ </span>
                    {u.email}
                  </>
                ),
              ],
            ]}
            renderActions={listActions}
          />
        ) : (
          <StandardGrid
            dataSource={data ?? []}
            keyExpr="username"
            onRowDblClick={(e) => isSuperAdmin && toEdit(e.data.username)}
            noDataText={fetching ? 'Cargando...' : 'Sin usuarios registrados.'}
          >
            <Column
              caption="Acciones"
              width={190}
              allowSorting={false}
              cellRender={({ data: row }) =>
                isSuperAdmin ? (
                  <div className="d-flex gap-1">
                    <CButton
                      size="sm"
                      color="primary"
                      variant="outline"
                      title="Editar"
                      onClick={() => toEdit(row.username)}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton
                      size="sm"
                      color="warning"
                      variant="outline"
                      title="Reset contraseña"
                      onClick={() => toEdit(row.username)}
                    >
                      Reset pw
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      title="Eliminar"
                      onClick={() => handleDelete(row)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                ) : null
              }
            />
            <Column dataField="username" caption="Username" width={140} defaultSortOrder="asc" />
            <Column dataField="name" caption="Nombre" />
            <Column dataField="email" caption="Email" />
            <Column
              dataField="role"
              caption="Rol"
              width={130}
              cellRender={({ value }) => <RoleBadge role={value} />}
            />
            <Column
              dataField="active"
              caption="Estado"
              width={90}
              cellRender={({ data: row }) => (
                <StatusBadge
                  active={row.active !== false}
                  onClick={isSuperAdmin ? () => handleToggleActive(row) : undefined}
                />
              )}
            />
          </StandardGrid>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Users
