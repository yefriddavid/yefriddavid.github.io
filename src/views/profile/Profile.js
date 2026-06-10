import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { CCard, CCardHeader, CCardBody, CButton, CBadge, CAlert } from '@coreui/react'
import * as authActions from 'src/actions/authActions'
import { authStorage } from 'src/utils/storage'
import { LANDING_PAGES } from 'src/constants/commons'
import {
  USER_ROLE_LABELS as ROLE_LABELS,
  USER_ROLE_COLORS as ROLE_COLORS,
} from 'src/constants/admin'
import Spinner from 'src/components/shared/Spinner'

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%231e3a5f"/><circle cx="32" cy="26" r="12" fill="%23a8d4f5"/><ellipse cx="32" cy="54" rx="18" ry="12" fill="%23a8d4f5"/></svg>'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const PasswordChangeForm = ({ saving, success, serverError, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { current: '', next: '', confirm: '' } })

  return (
    <div className="mt-3 pt-3 border-top d-flex flex-column gap-3">
      <div className="fw-semibold small">Cambiar contraseña</div>
      {success && <div style={{ color: '#2eb85c', fontSize: 13 }}>¡Contraseña actualizada!</div>}
      {serverError && <div style={{ color: '#e55353', fontSize: 13 }}>{serverError}</div>}
      <div>
        <label className="form-label small fw-semibold">Contraseña actual</label>
        <input
          className="form-control"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('current', { required: 'Ingresa tu contraseña actual' })}
        />
        {fieldError(errors.current)}
      </div>
      <div>
        <label className="form-label small fw-semibold">Nueva contraseña</label>
        <input
          className="form-control"
          type="password"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          {...register('next', {
            required: 'Ingresa la nueva contraseña',
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
          })}
        />
        {fieldError(errors.next)}
      </div>
      <div>
        <label className="form-label small fw-semibold">Confirmar contraseña</label>
        <input
          className="form-control"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('confirm', {
            validate: (val) => val === getValues('next') || 'Las contraseñas no coinciden',
          })}
        />
        {fieldError(errors.confirm)}
      </div>
      <div className="d-flex gap-2">
        <CButton size="sm" color="primary" onClick={handleSubmit(onSave)} disabled={saving}>
          {saving ? <Spinner size="sm" /> : 'Guardar'}
        </CButton>
        <CButton size="sm" color="secondary" variant="outline" onClick={onCancel}>
          Cancelar
        </CButton>
      </div>
    </div>
  )
}

const Profile = () => {
  const dispatch = useDispatch()
  const {
    data: profile,
    loading,
    error,
    pwChanging,
    pwSuccess,
    pwError: pwReduxError,
  } = useSelector((s) => s.profile)
  const fileInputRef = useRef(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  useEffect(() => {
    if (!pwSuccess) return
    const t = setTimeout(() => {
      setChangingPw(false)
      dispatch(authActions.changePasswordReset())
    }, 2000)
    return () => clearTimeout(t)
  }, [pwSuccess, dispatch])

  const pwDisplayError = (() => {
    if (!pwReduxError) return null
    const { code, message } = pwReduxError
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential')
      return 'Contraseña actual incorrecta'
    if (code === 'auth/too-many-requests') return 'Demasiados intentos. Intenta más tarde.'
    return message
  })()

  if (!profile) {
    return (
      <CCard>
        <CCardBody className="text-center py-5">
          {loading ? <Spinner /> : <p className="text-secondary">Perfil no disponible.</p>}
        </CCardBody>
      </CCard>
    )
  }

  const startEdit = () => {
    setForm({
      name: profile.name ?? '',
      email: profile.email ?? '',
      landingPage: profile.landingPage ?? '/finance/dashboard',
    })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setForm(null)
  }

  const saveEdit = () => {
    dispatch(authActions.updateProfile({ username: profile.username, ...form }))
    authStorage.setLandingPage(form.landingPage || '/finance/dashboard')
    setEditing(false)
    setForm(null)
  }

  const handleChangePassword = (data) => {
    dispatch(
      authActions.changePasswordRequest({
        username: profile.username,
        current: data.current,
        next: data.next,
      }),
    )
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      dispatch(authActions.updateAvatar({ username: profile.username, avatar: ev.target.result }))
      setAvatarLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const avatarSrc = profile.avatar || DEFAULT_AVATAR

  return (
    <CCard style={{ maxWidth: 560, margin: '0 auto' }}>
      <CCardHeader>
        <strong>Mi Perfil</strong>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{String(error)}</CAlert>}

        {/* Avatar section */}
        <div className="d-flex align-items-center gap-4 mb-4">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarSrc}
              alt="avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--cui-border-color, #dee2e6)',
              }}
            />
            {avatarLoading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Spinner size="sm" color="light" />
              </div>
            )}
          </div>
          <div>
            <div className="fw-semibold fs-5">{profile.name || profile.username}</div>
            <div className="text-secondary small mb-2">@{profile.username}</div>
            <CBadge color={ROLE_COLORS[profile.role] ?? 'secondary'}>
              {ROLE_LABELS[profile.role] ?? profile.role ?? 'Sin rol'}
            </CBadge>
          </div>
          <div className="ms-auto">
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
            >
              Cambiar foto
            </CButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Profile fields */}
        {editing ? (
          <div className="d-flex flex-column gap-3">
            <div>
              <label className="form-label small fw-semibold">Nombre</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="form-label small fw-semibold">Email</label>
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="form-label small fw-semibold">Página de inicio</label>
              <select
                className="form-select"
                value={form.landingPage}
                onChange={(e) => setForm((p) => ({ ...p, landingPage: e.target.value }))}
              >
                {LANDING_PAGES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="form-text">Página a la que irás después de iniciar sesión.</div>
            </div>
            <div className="d-flex gap-2 pt-1">
              <CButton color="primary" size="sm" onClick={saveEdit} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Guardar'}
              </CButton>
              <CButton color="secondary" variant="outline" size="sm" onClick={cancelEdit}>
                Cancelar
              </CButton>
            </div>
          </div>
        ) : (
          <div>
            <table className="table table-sm table-borderless mb-3">
              <tbody>
                <tr>
                  <td className="text-secondary small" style={{ width: 100 }}>
                    Nombre
                  </td>
                  <td className="fw-medium">{profile.name || '—'}</td>
                </tr>
                <tr>
                  <td className="text-secondary small">Email</td>
                  <td className="fw-medium">{profile.email || '—'}</td>
                </tr>
                <tr>
                  <td className="text-secondary small">Rol</td>
                  <td>
                    <CBadge color={ROLE_COLORS[profile.role] ?? 'secondary'}>
                      {ROLE_LABELS[profile.role] ?? profile.role ?? '—'}
                    </CBadge>
                  </td>
                </tr>
                <tr>
                  <td className="text-secondary small">Estado</td>
                  <td>
                    <CBadge color={profile.active !== false ? 'success' : 'secondary'}>
                      {profile.active !== false ? 'Activo' : 'Inactivo'}
                    </CBadge>
                  </td>
                </tr>
                <tr>
                  <td className="text-secondary small">Página de inicio</td>
                  <td className="fw-medium">
                    {LANDING_PAGES.find((p) => p.value === profile.landingPage)?.label ??
                      'Dashboard'}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="d-flex gap-2">
              <CButton size="sm" color="primary" variant="outline" onClick={startEdit}>
                Editar información
              </CButton>
              <CButton
                size="sm"
                color="secondary"
                variant="outline"
                onClick={() => {
                  setChangingPw((v) => !v)
                  dispatch(authActions.changePasswordReset())
                }}
              >
                Cambiar contraseña
              </CButton>
            </div>
          </div>
        )}

        {/* Password change panel — remounts on success so the fields reset */}
        {changingPw && (
          <PasswordChangeForm
            key={pwSuccess ? 'saved' : 'editing'}
            saving={pwChanging}
            success={pwSuccess}
            serverError={pwDisplayError}
            onSave={handleChangePassword}
            onCancel={() => {
              setChangingPw(false)
              dispatch(authActions.changePasswordReset())
            }}
          />
        )}
      </CCardBody>
    </CCard>
  )
}

export default Profile
