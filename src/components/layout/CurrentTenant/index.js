import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilBuilding } from '@coreui/icons'
import * as tenantsActions from '../../../actions/tenantsActions'
import useActiveTenantId from '../../../hooks/useActiveTenantId'
import './CurrentTenant.scss'

// Desktop-only label showing which tenant is currently active — the tenant
// picker (in AppHeaderDropdown) only shows the name once you open it, so on
// desktop there was no always-visible way to tell which one you're in.
const CurrentTenant = () => {
  const dispatch = useDispatch()
  const tenantIds = useSelector((s) => s.profile.data?.tenantIds ?? [])
  const { data: tenants } = useSelector((s) => s.tenants)
  const activeTenantId = useActiveTenantId()

  useEffect(() => {
    if (tenantIds.length > 0 && !tenants) dispatch(tenantsActions.fetchByIdsRequest(tenantIds))
  }, [tenantIds, tenants, dispatch])

  if (!activeTenantId) return null

  const tenant = (tenants ?? []).find((t) => t.id === activeTenantId)

  return (
    <div className="current-tenant d-none d-md-flex" title="Tenant activo">
      <CIcon icon={cilBuilding} size="sm" className="current-tenant__icon" />
      <span className="current-tenant__name">{tenant?.name ?? activeTenantId}</span>
    </div>
  )
}

export default CurrentTenant
