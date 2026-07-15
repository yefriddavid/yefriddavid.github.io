import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppModal from 'src/components/shared/AppModal'
import Spinner from 'src/components/shared/Spinner'
import * as tenantsActions from 'src/actions/tenantsActions'
import { selectTenant } from 'src/actions/authActions'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './TenantPicker.scss'

const noop = () => {}

const TenantPicker = ({ visible, onClose, forced = false }) => {
  const dispatch = useDispatch()
  const tenantIds = useSelector((s) => s.profile.data?.tenantIds ?? [])
  const { data: tenants, fetching } = useSelector((s) => s.tenants)
  const activeTenantId = useActiveTenantId()

  useEffect(() => {
    if (visible && tenantIds.length) dispatch(tenantsActions.fetchByIdsRequest(tenantIds))
  }, [visible, dispatch, tenantIds])

  const handlePick = (tenantId) => {
    dispatch(selectTenant(tenantId))
    if (!forced) onClose?.()
  }

  return (
    <AppModal
      visible={visible}
      onClose={forced ? noop : onClose}
      title="Selecciona un tenant"
      subtitle={forced ? 'Debes elegir con cuál trabajar para continuar.' : undefined}
      variant="center"
      size="sm"
    >
      {fetching && !tenants ? (
        <div className="tenant-picker__loading">
          <Spinner mode="section" />
        </div>
      ) : (
        <div className="tenant-picker__list">
          {tenantIds.map((id) => {
            const tenant = (tenants ?? []).find((t) => t.id === id)
            const isActive = id === activeTenantId
            return (
              <button
                key={id}
                type="button"
                className={`tenant-picker__item${isActive ? ' tenant-picker__item--active' : ''}`}
                onClick={() => handlePick(id)}
              >
                <span className="tenant-picker__item-name">{tenant?.name ?? id}</span>
                {isActive && <span className="tenant-picker__item-badge">Activo</span>}
              </button>
            )
          })}
        </div>
      )}
    </AppModal>
  )
}

export default TenantPicker
