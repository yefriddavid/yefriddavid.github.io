import React, { useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCard, CCardHeader, CCardBody, CButton, CBadge, CSpinner, CAlert,
} from '@coreui/react'
import * as authActions from 'src/actions/authActions'
import { changeOwnPassword } from 'src/services/providers/firebase/users'

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

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%231e3a5f"/><circle cx="32" cy="26" r="12" fill="%23a8d4f5"/><ellipse cx="32" cy="54" rx="18" ry="12" fill="%23a8d4f5"/></svg>'

const Profile = () => {
  const dispatch = useDispatch()
  const { data: profile, loading, error } = useSelector((s) => s.profile)
  const fileInputRef = useRef(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  if (!profile) {
    return (
      <CCard>
        <CCardBody className="text-center py-5">
          {loading ? <CSpinner /> : <p className="text-secondary">Perfil no disponible.</p>}
        </CCardBody>
      </CCard>
    )
  }

  const startEdit = () => {
    setForm({ name: profile.name ?? '', email: profile.email ?? '' })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setForm(null)
  }

  const saveEdit = () => {
    dispatch(authActions.updateProfile({ username: profile.username, ...form }))
    setEditing(false)
    setForm(null)
  }

  const handleChangePassword = async () => {
    setPwError(null)
    if (!pwForm.current) { setPwError('Ingresa tu contraseña actual'); return }
    if (!pwForm.next) { setPwError('Ingresa la nueva contraseña'); return }
    if (pwForm.next.length < 6) { setPwError('Mínimo 6 caracteres'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Las contraseñas no coinciden'); return }
    setPwLoading(true)
    try {
      await changeOwnPassword(profile.username, pwForm.current, pwForm.next)
      setPwSuccess(true)
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => { setChangingPw(false); setPwSuccess(false) }, 2000)
    } catch (e) {
      let msg = e.message
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') msg = 'Contraseña actual incorrecta'
      if (e.code === 'auth/too-many-requests') msg = 'Demasiados intentos. Intenta más tarde.'
      setPwError(msg)
    } finally {
      setPwLoading(false)
    }
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
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CSpinner size="sm" color="light" />
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
            <div className="d-flex gap-2 pt-1">
              <CButton color="primary" size="sm" onClick={saveEdit} disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Guardar'}
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
                  <td className="text-secondary small" style={{ width: 100 }}>Nombre</td>
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
              </tbody>
            </table>
            <div className="d-flex gap-2">
              <CButton size="sm" color="primary" variant="outline" onClick={startEdit}>
                Editar información
              </CButton>
              <CButton size="sm" color="secondary" variant="outline" onClick={() => { setChangingPw((v) => !v); setPwError(null); setPwSuccess(false) }}>
                Cambiar contraseña
              </CButton>
            </div>
          </div>
        )}

        {/* Password change panel */}
        {changingPw && (
          <div className="mt-3 pt-3 border-top d-flex flex-column gap-3">
            <div className="fw-semibold small">Cambiar contraseña</div>
            {pwSuccess && <div style={{ color: '#2eb85c', fontSize: 13 }}>¡Contraseña actualizada!</div>}
            {pwError && <div style={{ color: '#e55353', fontSize: 13 }}>{pwError}</div>}
            <div>
              <label className="form-label small fw-semibold">Contraseña actual</label>
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={pwForm.current}
                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="form-label small fw-semibold">Nueva contraseña</label>
              <input
                className="form-control"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={pwForm.next}
                onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="form-label small fw-semibold">Confirmar contraseña</label>
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div className="d-flex gap-2">
              <CButton size="sm" color="primary" onClick={handleChangePassword} disabled={pwLoading}>
                {pwLoading ? <CSpinner size="sm" /> : 'Guardar'}
              </CButton>
              <CButton size="sm" color="secondary" variant="outline" onClick={() => { setChangingPw(false); setPwError(null) }}>Cancelar</CButton>
            </div>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Profile
