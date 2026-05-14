import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
  CBadge,
  CAlert,
  CButton,
  CCollapse,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilTrash } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import * as usersActions from 'src/actions/usersActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { sendUserPasswordReset } from 'src/services/firebase/security/users'
import { LANDING_PAGES } from 'src/constants/commons'

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

const EMPTY = {
  username: '',
  name: '',
  role: 'manager',
  email: '',
  active: true,
  password: '',
  confirmPassword: '',
  landingPage: '/finance/dashboard',
}

const RoleBadge = ({ role }) => (
  <CBadge color={ROLE_COLORS[role] ?? 'secondary'}>{ROLE_LABELS[role] ?? role}</CBadge>
)

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const UserForm = ({ initial, onSave, onCancel, saving, title, isNew }) => {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  const active = watch('active') ?? true

  return (
    <StandardForm title={title} onCancel={onCancel} onSave={handleSubmit(onSave)} saving={saving}>
      <StandardField label="Username">
        <input
          className={SF.input}
          placeholder="username"
          disabled={!isNew}
          {...register('username', { required: 'El username es obligatorio' })}
        />
        {fieldError(errors.username)}
      </StandardField>
      <StandardField label="Nombre">
        <input className={SF.input} placeholder="Nombre completo" {...register('name')} />
      </StandardField>
      <StandardField label="Email *">
        <input
          className={SF.input}
          type="email"
          placeholder="correo@ejemplo.com"
          disabled={!isNew}
          {...register('email', { required: 'El email es obligatorio' })}
        />
        {fieldError(errors.email)}
      </StandardField>
      <StandardField label="Rol">
        <select className={SF.select} {...register('role')}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </StandardField>
      <StandardField label="Página de inicio">
        <select className={SF.select} {...register('landingPage')}>
          {LANDING_PAGES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
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
              autoComplete="new-password"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            {fieldError(errors.password)}
          </StandardField>
          <StandardField label="Confirmar contraseña">
            <input
              className={SF.input}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword', {
                validate: (val) =>
                  val === getValues('password') || 'Las contraseñas no coinciden',
              })}
            />
            {fieldError(errors.confirmPassword)}
          </StandardField>
        </>
      )}
      <StandardField label="Activo">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={active} {...register('active')} />
          <span>{active ? 'Activo' : 'Inactivo'}</span>
        </label>
      </StandardField>
    </StandardForm>
  )
}

const formatUA = (ua) => {
  if (!ua) return 'Desconocido'
  if (/iPhone|iPad/.test(ua)) return 'iOS'
  if (/Android/.test(ua)) return 'Android'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac OS/.test(ua)) return 'Mac'
  if (/Linux/.test(ua)) return 'Linux'
  return ua.slice(0, 40)
}

const SessionsDetail = React.memo(({ data: user }) => {
  const dispatch = useDispatch()
  const currentSessionId = localStorage.getItem('sessionId')
  const sessionsState = useSelector((s) => s.users.sessions[user.username])
  const sessions = sessionsState?.data ?? []
  const fetching = sessionsState?.fetching ?? false

  useEffect(() => {
    // Solo pedir si no hay datos y no se está cargando ya
    if (!sessionsState && !fetching) {
      dispatch(usersActions.fetchSessionsRequest(user.username))
    }
  }, [user.username, dispatch, sessionsState, fetching])

  const handleDelete = (sessionId) => {
    if (!window.confirm('¿Cerrar esta sesión?')) return
    dispatch(usersActions.deleteSessionRequest({ username: user.username, sessionId }))
  }

  const handleDeleteAll = () => {
    if (!window.confirm(`¿Cerrar todas las sesiones de "${user.username}"?`)) return
    dispatch(usersActions.deleteAllSessionsRequest(user.username))
  }

  if (fetching) {
    return (
      <div style={{ padding: 12 }}>
        <CSpinner size="sm" /> Cargando sesiones...
      </div>
    )
  }

  if (!sessions.length) {
    return <div style={{ padding: 12, color: '#888', fontSize: 13 }}>Sin sesiones activas.</div>
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e3a5f' }}>
          Sesiones activas ({sessions.length})
        </div>
        <CButton size="sm" color="danger" variant="outline" onClick={handleDeleteAll}>
          Matar todas
        </CButton>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f4f6f9' }}>
            <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>Dispositivo</th>
            <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>Creada</th>
            <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>Estado</th>
            <th style={{ padding: '6px 10px' }}></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId} style={{ borderTop: '1px solid #e8ecf0' }}>
              <td style={{ padding: '6px 10px' }}>{formatUA(s.userAgent)}</td>
              <td style={{ padding: '6px 10px', color: '#666' }}>
                {s.createdAt ? new Date(s.createdAt).toLocaleString('es-CO') : '—'}
              </td>
              <td style={{ padding: '6px 10px' }}>
                {s.sessionId === currentSessionId ? (
                  <CBadge color="success">Actual</CBadge>
                ) : (
                  <CBadge color="secondary">Activa</CBadge>
                )}
              </td>
              <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  title="Cerrar sesión"
                  onClick={() => handleDelete(s.sessionId)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

const UserDetail = React.memo(({ data: user, onSave, saving }) => {
  return (
    <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <CRow>
        <CCol md={5} className="border-end">
          <div style={{ paddingRight: 16 }}>
            <UserForm
              initial={{ ...user, email: user.email ?? '' }}
              isNew={false}
              title={`Editar Usuario: ${user.username}`}
              onSave={onSave}
              onCancel={null} // No necesitamos cancelar aquí, solo cerrar la fila
              saving={saving}
            />
          </div>
        </CCol>
        <CCol md={7}>
          <SessionsDetail data={user} />
        </CCol>
      </CRow>
    </div>
  )
})

const Users = () => {
  const dispatch = useDispatch()
  const { data, fetching, isError, error } = useSelector((s) => s.users)
  const profile = useSelector((s) => s.profile.data)
  const isSuperAdmin = profile?.role === 'superAdmin'
  const gridRef = useRef(null)

  const [showForm, setShowForm] = useState(false)
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
    // Al ser en el MasterDetail, no cerramos nada manualmente,
    // el grid se actualizará cuando el saga termine.
  }

  const handleDelete = (row) => {
    if (!window.confirm(`¿Eliminar usuario "${row.username}"?`)) return
    dispatch(usersActions.deleteRequest({ username: row.username }))
  }

  const handlePasswordReset = async (row) => {
    if (!row.email) {
      setResetMsg({ type: 'danger', text: 'El usuario no tiene email registrado' })
      return
    }
    try {
      await sendUserPasswordReset(row.email)
      setResetMsg({ type: 'success', text: `Email de recuperación enviado a ${row.email}` })
    } catch (e) {
      setResetMsg({ type: 'danger', text: e.message })
    }
    setTimeout(() => setResetMsg(null), 4000)
  }

  const toggleRow = (row) => {
    if (!gridRef.current) return
    const instance = gridRef.current.instance
    const key = row.username

    if (instance.isRowExpanded(key)) {
      instance.collapseRow(key)
    } else {
      instance.collapseAll(-1)
      instance.expandRow(key)
    }
  }

  const onRowDblClick = (e) => {
    toggleRow(e.data)
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <strong>Usuarios</strong>
        {fetching && <CSpinner size="sm" />}
        <div className="ms-auto d-flex gap-2">
          {isSuperAdmin &&
            (showForm ? (
              <CButton
                size="sm"
                color="secondary"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                <CIcon icon={cilX} /> Cancelar
              </CButton>
            ) : (
              <CButton
                size="sm"
                color="primary"
                onClick={() => {
                  setShowForm(true)
                }}
              >
                <CIcon icon={cilPlus} /> Nuevo usuario
              </CButton>
            ))}
        </div>
      </CCardHeader>

      <CCardBody className="p-0">
        {isError && (
          <CAlert color="danger" className="m-3">
            {String(error)}
          </CAlert>
        )}
        {resetMsg && (
          <CAlert color={resetMsg.type} className="m-3">
            {resetMsg.text}
          </CAlert>
        )}

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

        <StandardGrid
          ref={gridRef}
          dataSource={data ?? []}
          keyExpr="username"
          onRowDblClick={onRowDblClick}
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
                    <CButton
                      size="sm"
                      color="primary"
                      variant="outline"
                      onClick={() => toggleRow(row)}
                    >
                      Editar
                    </CButton>
                    <CButton
                      size="sm"
                      color="warning"
                      variant="outline"
                      title="Enviar email de recuperación"
                      onClick={() => handlePasswordReset(row)}
                    >
                      Reset pw
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      onClick={() => handleDelete(row)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </>
                )}
              </div>
            )}
          />
          <MasterDetail
            enabled
            render={({ data: row }) => (
              <UserDetail data={row} onSave={handleUpdate} saving={fetching} />
            )}
          />
        </StandardGrid>
      </CCardBody>
    </CCard>
  )
}

export default Users
