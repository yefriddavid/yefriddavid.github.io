import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { CCard, CCardHeader, CCardBody, CRow, CCol, CButton, CBadge, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilTrash } from '@coreui/icons'
import { authStorage } from 'src/utils/storage'
import * as usersActions from 'src/actions/usersActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { LANDING_PAGES } from 'src/constants/commons'
import { USER_ROLES as ROLES, USER_ROLE_LABELS as ROLE_LABELS } from 'src/constants/admin'
import Spinner from 'src/components/shared/Spinner'

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
                validate: (val) => val === getValues('password') || 'Las contraseñas no coinciden',
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
  const currentSessionId = authStorage.getSessionId()
  const sessionsState = useSelector((s) => s.users.sessions[user.username])
  const sessions = sessionsState?.data ?? []
  const fetching = sessionsState?.fetching ?? false

  useEffect(() => {
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
        <Spinner size="sm" /> Cargando sesiones...
      </div>
    )
  }

  if (!sessions.length) {
    return <div style={{ padding: 12, color: '#888', fontSize: 13 }}>Sin sesiones activas.</div>
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
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

const ResetPasswordPanel = ({ username }) => {
  const dispatch = useDispatch()
  const { resetLoading, resetError, resetSuccess } = useSelector((s) => s.users)
  const [resetPw, setResetPw] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (resetError) {
      setMsg({ type: 'danger', text: resetError })
      setTimeout(() => setMsg(null), 4000)
    }
  }, [resetError])

  useEffect(() => {
    if (resetSuccess) {
      setMsg({
        type: 'success',
        text: `Contraseña de "${resetSuccess}" actualizada. Recuerda correr task auth:sync para sincronizar Firebase Auth.`,
      })
      setResetPw('')
      setTimeout(() => setMsg(null), 5000)
    }
  }, [resetSuccess])

  const handleReset = () => {
    if (!resetPw || resetPw.length < 6) {
      setMsg({ type: 'danger', text: 'Mínimo 6 caracteres' })
      return
    }
    dispatch(usersActions.adminResetPasswordRequest({ username, password: resetPw }))
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="fw-semibold small mb-2">Establecer nueva contraseña</div>
      {msg && (
        <CAlert color={msg.type} className="py-2">
          {msg.text}
        </CAlert>
      )}
      <div className="d-flex gap-2 align-items-center" style={{ maxWidth: 360 }}>
        <input
          className="form-control form-control-sm"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={resetPw}
          onChange={(e) => setResetPw(e.target.value)}
          autoComplete="new-password"
        />
        <CButton size="sm" color="warning" onClick={handleReset} disabled={!!resetLoading}>
          {resetLoading ? <Spinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}

const UserEdit = () => {
  const { username } = useParams()
  const isNew = username === 'new'
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data, fetching } = useSelector((s) => s.users)
  const user = isNew ? null : (data ?? []).find((u) => u.username === username)

  useEffect(() => {
    if (!data) dispatch(usersActions.fetchRequest())
  }, [dispatch, data])

  const handleSave = (form) => {
    if (isNew) {
      dispatch(usersActions.createRequest(form))
    } else {
      dispatch(usersActions.updateRequest(form))
    }
    navigate(-1)
  }

  if (!isNew && fetching && !user) return <Spinner mode="section" />
  if (!isNew && !user)
    return (
      <CAlert color="warning" className="m-3">
        Usuario no encontrado.
      </CAlert>
    )

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <CButton size="sm" color="secondary" variant="outline" onClick={() => navigate(-1)}>
          <CIcon icon={cilArrowLeft} />
        </CButton>
        <strong>{isNew ? 'Nuevo usuario' : `Usuario: ${username}`}</strong>
        {fetching && <Spinner size="sm" />}
      </CCardHeader>
      <CCardBody>
        {isNew ? (
          <div style={{ maxWidth: 480 }}>
            <UserForm
              initial={EMPTY}
              isNew
              title="Nuevo usuario"
              onSave={handleSave}
              onCancel={() => navigate(-1)}
              saving={fetching}
            />
          </div>
        ) : (
          <CRow>
            <CCol md={5} className="border-end">
              <UserForm
                initial={{ ...user, email: user.email ?? '' }}
                isNew={false}
                title={`Editar: ${username}`}
                onSave={handleSave}
                onCancel={() => navigate(-1)}
                saving={fetching}
              />
              <ResetPasswordPanel username={username} />
            </CCol>
            <CCol md={7}>
              <SessionsDetail data={user} />
            </CCol>
          </CRow>
        )}
      </CCardBody>
    </CCard>
  )
}

export default UserEdit
