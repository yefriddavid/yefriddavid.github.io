import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilUser, cilCode } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { clearProfile } from '../../actions/authActions'
import { deleteSession } from '../../services/providers/firebase/Security/sessions'
import avatar8 from './../../assets/images/avatars/8.jpg'
import VersionModal from './VersionModal'

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%231e3a5f"/><circle cx="32" cy="26" r="12" fill="%23a8d4f5"/><ellipse cx="32" cy="54" rx="18" ry="12" fill="%23a8d4f5"/></svg>'

const ROLE_LABELS = {
  superAdmin: 'Super Admin',
  manager: 'Manager',
  conductor: 'Conductor',
}

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const profile = useSelector((s) => s.profile.data)
  const [versionOpen, setVersionOpen] = useState(false)

  const avatarSrc = profile?.avatar || (profile ? DEFAULT_AVATAR : avatar8)
  const displayName = profile?.name || profile?.username || null

  const logout = () => {
    const sessionId = localStorage.getItem('sessionId')
    if (sessionId) deleteSession(sessionId).catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('sessionId')
    dispatch(clearProfile())
    navigate('/login')
  }

  return (
    <>
    <VersionModal visible={versionOpen} onClose={() => setVersionOpen(false)} />
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatarSrc} size="md" style={{ objectFit: 'cover' }} />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {displayName && (
          <>
            <div className="px-3 py-2 border-bottom">
              <div className="fw-semibold small">{displayName}</div>
              {profile?.role && (
                <div className="text-secondary" style={{ fontSize: 11 }}>
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </div>
              )}
            </div>
          </>
        )}
        <CDropdownItem onClick={() => navigate('/cash_flow/profile')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
          Mi perfil
        </CDropdownItem>
        <CDropdownItem onClick={() => setVersionOpen(true)} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilCode} className="me-2" />
          Versión
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={logout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
    </>
  )
}

export default AppHeaderDropdown
