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
import { cilPlus, cilTrash, cilX } from '@coreui/icons'
import * as tenantsActions from 'src/actions/tenantsActions'
import * as usersActions from 'src/actions/usersActions'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'

const PLANS = ['basic', 'pro', 'enterprise']

const PLAN_COLORS = {
  basic: 'secondary',
  pro: 'primary',
  enterprise: 'warning',
}

const EMPTY = {
  name: '',
  slug: '',
  plan: 'basic',
  contactName: '',
  contactEmail: '',
  active: true,
}

const PlanBadge = ({ plan }) => (
  <CBadge color={PLAN_COLORS[plan] ?? 'secondary'}>{plan ?? '—'}</CBadge>
)

const TenantForm = ({ initial, onSave, onCancel, saving, title, isNew }) => {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState(null)
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const toggle = (field) => () => setForm((p) => ({ ...p, [field]: !p[field] }))

  const handleSave = () => {
    setError(null)
    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!form.slug.trim()) {
      setError('El slug es obligatorio')
      return
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setError('El slug solo puede contener letras minúsculas, números y guiones')
      return
    }
    onSave(form)
  }

  return (
    <StandardForm title={title} onCancel={onCancel} onSave={handleSave} saving={saving}>
      <StandardField label="Nombre *">
        <input
          className={SF.input}
          placeholder="Nombre del tenant"
          value={form.name}
          onChange={set('name')}
        />
      </StandardField>
      <StandardField label="Slug *">
        <input
          className={SF.input}
          placeholder="mi-empresa"
          value={form.slug}
          onChange={set('slug')}
          disabled={!isNew}
        />
      </StandardField>
      <StandardField label="Plan">
        <select className={SF.select} value={form.plan} onChange={set('plan')}>
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </StandardField>
      <StandardField label="Contacto">
        <input
          className={SF.input}
          placeholder="Nombre del contacto"
          value={form.contactName}
          onChange={set('contactName')}
        />
      </StandardField>
      <StandardField label="Email contacto">
        <input
          className={SF.input}
          type="email"
          placeholder="contacto@empresa.com"
          value={form.contactEmail}
          onChange={set('contactEmail')}
        />
      </StandardField>
      {error && (
        <div style={{ color: '#e55353', fontSize: 12, padding: '4px 0 0 2px' }}>{error}</div>
      )}
      <StandardField label="Activo">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={toggle('active')} />
          <span>{form.active ? 'Activo' : 'Inactivo'}</span>
        </label>
      </StandardField>
    </StandardForm>
  )
}

const ROLE_LABELS = { superAdmin: 'Super Admin', manager: 'Manager', conductor: 'Conductor' }
const ROLE_COLORS = { superAdmin: 'danger', manager: 'primary', conductor: 'secondary' }

const MembersPanel = React.memo(({ tenant }) => {
  const dispatch = useDispatch()
  const allUsers = useSelector((s) => s.users.data ?? [])
  const usersLoading = useSelector((s) => s.users.fetching)

  useEffect(() => {
    if (!allUsers.length) dispatch(usersActions.fetchRequest())
  }, [dispatch, allUsers.length])

  const members = allUsers.filter((u) => u.tenantId === tenant.id)
  const available = allUsers.filter((u) => !u.tenantId || u.tenantId === tenant.id)

  const assign = (username) =>
    dispatch(tenantsActions.assignUserRequest({ username, tenantId: tenant.id }))
  const unassign = (username) =>
    dispatch(tenantsActions.assignUserRequest({ username, tenantId: null }))

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#1e3a5f' }}>
        Miembros ({members.length})
      </div>
      {usersLoading && <CSpinner size="sm" />}
      {members.length === 0 && !usersLoading && (
        <p style={{ fontSize: 13, color: '#888' }}>Sin miembros asignados.</p>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
        <tbody>
          {members.map((u) => (
            <tr key={u.username} style={{ borderTop: '1px solid #e8ecf0' }}>
              <td style={{ padding: '6px 8px', fontWeight: 600 }}>{u.username}</td>
              <td style={{ padding: '6px 8px' }}>{u.name}</td>
              <td style={{ padding: '6px 8px' }}>
                <CBadge color={ROLE_COLORS[u.role] ?? 'secondary'}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </CBadge>
              </td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  onClick={() => unassign(u.username)}
                >
                  <CIcon icon={cilX} />
                </CButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#1e3a5f' }}>
        Agregar usuario
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {allUsers
          .filter((u) => u.tenantId !== tenant.id)
          .map((u) => (
            <CButton
              key={u.username}
              size="sm"
              color={u.tenantId ? 'warning' : 'primary'}
              variant="outline"
              title={u.tenantId ? `Actualmente en tenant: ${u.tenantId}` : undefined}
              onClick={() => assign(u.username)}
            >
              {u.username}
              {u.tenantId && ' ⚠'}
            </CButton>
          ))}
      </div>
    </div>
  )
})

const TenantDetail = React.memo(({ data: tenant, onSave, saving }) => (
  <div style={{ padding: 16, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
    <CRow>
      <CCol md={5} className="border-end" style={{ paddingRight: 24 }}>
        <TenantForm
          initial={tenant}
          isNew={false}
          title={`Editar: ${tenant.name}`}
          onSave={onSave}
          onCancel={null}
          saving={saving}
        />
      </CCol>
      <CCol md={7} style={{ paddingLeft: 24 }}>
        <MembersPanel tenant={tenant} />
      </CCol>
    </CRow>
  </div>
))

const Tenants = () => {
  const dispatch = useDispatch()
  const { data, fetching, isError, error } = useSelector((s) => s.tenants)
  const gridRef = useRef(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    dispatch(tenantsActions.fetchRequest())
    dispatch(usersActions.fetchRequest())
  }, [dispatch])

  const handleCreate = (form) => {
    dispatch(tenantsActions.createRequest(form))
    setShowForm(false)
  }

  const handleUpdate = (form) => {
    dispatch(tenantsActions.updateRequest(form))
  }

  const handleDelete = (row) => {
    if (!window.confirm(`¿Eliminar tenant "${row.name}"?`)) return
    dispatch(tenantsActions.deleteRequest({ id: row.id }))
  }

  const toggleRow = (row) => {
    if (!gridRef.current) return
    const instance = gridRef.current.instance
    if (instance.isRowExpanded(row.id)) {
      instance.collapseRow(row.id)
    } else {
      instance.collapseAll(-1)
      instance.expandRow(row.id)
    }
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center gap-2">
        <strong>Tenants</strong>
        {fetching && <CSpinner size="sm" />}
        <div className="ms-auto d-flex gap-2">
          {showForm ? (
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              <CIcon icon={cilX} /> Cancelar
            </CButton>
          ) : (
            <CButton size="sm" color="primary" onClick={() => setShowForm(true)}>
              <CIcon icon={cilPlus} /> Nuevo tenant
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

        <CCollapse visible={showForm}>
          <div className="p-3 border-bottom" style={{ maxWidth: '50%' }}>
            <TenantForm
              initial={EMPTY}
              isNew={true}
              title="Nuevo tenant"
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              saving={fetching}
            />
          </div>
        </CCollapse>

        <StandardGrid
          ref={gridRef}
          dataSource={data ?? []}
          keyExpr="id"
          onRowDblClick={(e) => toggleRow(e.data)}
          noDataText={fetching ? 'Cargando...' : 'Sin tenants registrados.'}
        >
          <Column dataField="name" caption="Nombre" />
          <Column dataField="slug" caption="Slug" width={160} />
          <Column
            dataField="plan"
            caption="Plan"
            width={120}
            cellRender={({ value }) => <PlanBadge plan={value} />}
          />
          <Column dataField="contactName" caption="Contacto" />
          <Column dataField="contactEmail" caption="Email" />
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
            width={120}
            allowSorting={false}
            cellRender={({ data: row }) => (
              <div className="d-flex gap-1">
                <CButton size="sm" color="primary" variant="outline" onClick={() => toggleRow(row)}>
                  Editar
                </CButton>
                <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(row)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </div>
            )}
          />
          <MasterDetail
            enabled
            render={({ data: row }) => (
              <TenantDetail data={row} onSave={handleUpdate} saving={fetching} />
            )}
          />
        </StandardGrid>
      </CCardBody>
    </CCard>
  )
}

export default Tenants
