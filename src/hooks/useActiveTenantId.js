import { useSelector } from 'react-redux'

export const useActiveTenantId = () => useSelector((s) => s.profile?.data?.activeTenantId ?? null)

export default useActiveTenantId
