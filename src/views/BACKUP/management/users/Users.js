import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid/Index'
import {
  CCard, CCardHeader, CCardBody, CSpinner, CBadge, CAlert,
  CButton, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash } from '@coreui/icons'
import * as usersActions from 'src/actions/usersActions'
import StandardForm, { StandardField, SF } from 'src/components/App/StandardForm'
import { sendUserPasswordReset } from 'src/services/providers/firebase/users'

const ROLES = ['superAdmin', 'manager', 'conductor']

const ROLE_LABELS = {
  superAdmin: 'Super Admin',
  manager: 'Manager',
  conductor: 'Conductor',
}

const ROLE_COLORS = {
  superAdmin: 'danger',
  manager: 'primary',
  conductor: 'secondary',
}

const EMPTY = { username: '', name: '', role: 'manager', email: '', active: true, password: '', confirmPassword: '' }

const RoleBadge = ({ role }) => (
  <CBadge color={ROLE_COLORS[role] ?? 'secondary'}>
    {ROLE_LABELS[role] ?? role}
  </CBadge>
)

const UserForm = ({ initial, onSave, onCancel, saving, title, isNew }) => {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState(null)
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const toggle = (field) => () => setForm((p) => ({ ...p, [field]: !p[field] }))

  const handleSave = () => {
    setError(null)
    if (!form.username.trim()) { setError('El username es obligatorio'); return }
    if (!form.email.trim()) { setError('El email es obligatorio'); return }
    if (isNew && !form.password) { setError('La contraseña es obligatoria'); return }
    if (isNew && form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden'); return }
    if (isNew && form.password.length < 6) { setError('Mínimo 6 caracteres'); return }
    onSave(form)
  }

  return (
    <StandardForm title={title} onCancel={onCancel} onSave={handleSave} saving={saving}>
      <StandardField label="Username">
        <input
          className={SF.input}
          placeholder="username"
          value={form.username}
          onChange={set('username')}
          disabled={!isNew}
        />
      </StandardField>
      <StandardField label="Nombre">
        <input className={SF.input} placeholder="Nombre completo" value={form.name} onChange={set('name')} />
      </StandardField>
      <StandardField label="Email *">
        <input
          className={SF.input}
          type="email"
          placeholder="correo@ejemplo.com"
          value={form.email}
          onChange={set('email')}
          disabled={!isNew}
        />
      </StandardField>
      <StandardField label="Rol">
        <select className={SF.select} value={form.role} onChange={set('role')}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </StandardField>
      {isNew && (
        <>
          <StandardField label="Contraseña *">
            <input
              className={SF.input}
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
            />
          </StandardField>
          <StandardField label="Confirmar contraseña">
            <input
              className={SF.input}
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              autoComplete="new-password"
            />
          </StandardField>
        </>
      )}
      {error && <div style={{ color: '#e55353', fontSize: 12, padding: '4px 0 0 2px' }}>{error}</div>}
      <StandardField label="Activo">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={toggle('active')} />
          <span>{form.active ? 'Activo' : 'Inactivo'}</span>
        </label>
      </StandardField>
    </StandardForm>
  )
}

const Users = () => {
  const dispatch = useDispatch()
  const { data, fetching, isError, error } = useSelector((s) => s.users)
  const profile = useSelector((s) => s.profile.data)
  const isSuperAdmin = profile?.role === 'superAdmin'
  const gridRef = useRef(null)

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [resetMsg, setResetMsg] = useState(null)

  useEffect(() => {
    dispatch(usersActions.fetchRequest())
  }, [dispatch])

  const handleCreate = (form) => {
    dispatch(usersActions.createRequest(form))
    setShowForm(false)
  }

  const handleUpdate = (form) => {
    dispatch(usersActions.updateRequest(form))
    setEditTarget(null)
  }

  const handleDelete = (row) => {
    if (!window.confirm(`¿Eliminar usuario "${row.username}"?`)) return
    dispatch(usersActions.deleteRequest({ username: row.username }))
  }

  const handlePasswordReset = async (row) => {
    if (!row.email) { setResetMsg({ type: 'danger', text: 'El usuario no tiene email registrado' }); return }
    try {
      await sendUserPasswordReset(row.email)
      setResetMsg({ type: 'success', text: `Email de recuperación enviado a ${row.email}` })
    } catch (e) {
      setResetMsg({ type: 'danger', text: e.message })
    }
    setTimeout(() => setResetMsg(null), 4000)
  }

  const openEdit = (row) => {
    if (!isSuperAdmin) return
    setShowForm(false)
    setEditTarget({ ...row, email: row.email ?? '' })
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <strong>Usuarios</strong>
        {fetching && <CSpinner size="sm" />}
        <div className="ms-auto d-flex gap-2">
          {isSuperAdmin && (
            showForm ? (
              <CButton size="sm" color="secondary" variant="outline" onClick={() => setShowForm(false)}>
                <CIcon icon={cilX} /> Cancelar
              </CButton>
            ) : (
              <CButton size="sm" color="primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
                <CIcon icon={cilPlus} /> Nuevo usuario
              </CButton>
            )
          )}
        </div>
      </CCardHeader>

      <CCardBody className="p-0">
        {isError && <CAlert color="danger" className="m-3">{String(error)}</CAlert>}
        {resetMsg && <CAlert color={resetMsg.type} className="m-3">{resetMsg.text}</CAlert>}

        <CCollapse visible={showForm}>
          <div className="p-3 border-bottom" style={{ maxWidth: '50%' }}>
            <UserForm
              initial={EMPTY}
              isNew={true}
              title="Nuevo usuario"
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              saving={fetching}
            />
          </div>
        </CCollapse>

        <CCollapse visible={!!editTarget}>
          {editTarget && (
            <div className="p-3 border-bottom" style={{ maxWidth: '50%' }}>
              <UserForm
                initial={editTarget}
                isNew={false}
                title={`Editar: ${editTarget.username}`}
                onSave={handleUpdate}
                onCancel={() => setEditTarget(null)}
                saving={fetching}
              />
            </div>
          )}
        </CCollapse>

        <StandardGrid
          ref={gridRef}
          dataSource={data ?? []}
          keyExpr="username"
          onRowDblClick={({ data: row }) => openEdit(row)}
          noDataText={fetching ? 'Cargando...' : 'Sin usuarios registrados.'}
        >
          <Column dataField="username" caption="Username" width={140} />
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
            cellRender={({ value }) => (
              <CBadge color={value !== false ? 'success' : 'secondary'}>
                {value !== false ? 'Activo' : 'Inactivo'}
              </CBadge>
            )}
          />
          <Column
            caption="Acciones"
            width={160}
            allowSorting={false}
            cellRender={({ data: row }) => (
              <div className="d-flex gap-1">
                {isSuperAdmin && (
                  <>
                    <CButton size="sm" color="primary" variant="outline" onClick={() => openEdit(row)}>
                      Editar
                    </CButton>
                    <CButton size="sm" color="warning" variant="outline" title="Enviar email de recuperación" onClick={() => handlePasswordReset(row)}>
                      Reset pw
                    </CButton>
                    <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(row)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </>
                )}
              </div>
            )}
          />
        </StandardGrid>
      </CCardBody>
    </CCard>
  )
}

export default Users
