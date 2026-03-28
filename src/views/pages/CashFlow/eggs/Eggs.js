import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilPencil } from '@coreui/icons'
import { Column, Editing, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid'
import * as eggActions from 'src/actions/CashFlow/eggActions'

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = { name: '', date: today(), quantity: '', price: '', total: '' }

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)

export default function Eggs() {
  const dispatch = useDispatch()
  const { data: eggs, fetching, saving } = useSelector((s) => s.egg)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)

  const gridRef = useRef(null)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [toast, setToast] = useState(false)
  const toastTimer = useRef(null)
  const prevSaving = useRef(false)

  useEffect(() => {
    if (prevSaving.current && !saving) {
      setToast(true)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(false), 3000)
    }
    prevSaving.current = saving
  }, [saving])

  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterOp, setFilterOp] = useState('=')

  const years = useMemo(() => {
    if (!eggs) return []
    const set = new Set(eggs.map((e) => e.date?.slice(0, 4)).filter(Boolean))
    return [...set].sort((a, b) => b - a)
  }, [eggs])

  const filtered = useMemo(() => {
    if (!eggs) return []
    return eggs.filter((e) => {
      const d = e.date ?? ''
      if (filterYear && !d.startsWith(filterYear)) return false
      if (filterMonth && d.slice(5, 7) !== filterMonth.padStart(2, '0')) return false
      if (filterDate) {
        if (filterOp === '=' && d !== filterDate) return false
        if (filterOp === '>' && d <= filterDate) return false
        if (filterOp === '<' && d >= filterDate) return false
      }
      return true
    })
  }, [eggs, filterYear, filterMonth, filterDate, filterOp])

  useEffect(() => {
    dispatch(eggActions.fetchRequest())
  }, [dispatch])

  const openCreate = () => {
    setForm(EMPTY)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    const total = row.quantity != null && row.price != null ? (row.quantity * row.price).toFixed(2) : ''
    setForm({ name: row.name, date: row.date, quantity: row.quantity, price: row.price, total })
    setEditingId(row.id)
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name || !form.date || form.quantity === '' || form.price === '') return
    if (editingId) {
      dispatch(eggActions.updateRequest({ id: editingId, ...form }))
    } else {
      dispatch(eggActions.createRequest(form))
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this record?')) {
      dispatch(eggActions.deleteRequest({ id }))
    }
  }

  const handleNumeric = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: val }
      const q = parseFloat(field === 'quantity' ? val : prev.quantity)
      const p = parseFloat(field === 'price' ? val : prev.price)
      const t = parseFloat(field === 'total' ? val : prev.total)
      if (field === 'quantity' && !isNaN(q) && !isNaN(p)) next.total = (q * p).toFixed(2)
      if (field === 'price' && !isNaN(q) && !isNaN(p)) next.total = (q * p).toFixed(2)
      if (field === 'total' && !isNaN(t) && !isNaN(p) && p !== 0) next.quantity = (t / p).toFixed(4)
      if (field === 'total' && !isNaN(t) && !isNaN(q) && q !== 0 && (isNaN(p) || p === 0)) next.price = (t / q).toFixed(2)
      return next
    })
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '8px 16px' }}>
        <CButton color="primary" size="sm" onClick={openCreate}>
          <CIcon icon={cilPlus} className="me-1" />
          New Egg
        </CButton>

        <select
          className="form-select form-select-sm"
          style={{ width: 90 }}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          className="form-select form-select-sm"
          style={{ width: 120 }}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">All months</option>
          {['January','February','March','April','May','June','July','August','September','October','November','December']
            .map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
        </select>

        <select
          className="form-select form-select-sm"
          style={{ width: 60 }}
          value={filterOp}
          onChange={(e) => setFilterOp(e.target.value)}
        >
          <option value="=">=</option>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
        </select>

        <input
          className="form-control form-control-sm"
          type="date"
          style={{ width: 145 }}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />

        {(filterYear || filterMonth || filterDate) && (
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => { setFilterYear(''); setFilterMonth(''); setFilterDate(''); setFilterOp('=') }}
          >
            Clear
          </CButton>
        )}

        {hasPendingChanges && !saving && (
          <CButton
            color="success"
            size="sm"
            onClick={() => gridRef.current?.instance?.saveEditData()}
          >
            Save changes
          </CButton>
        )}
        {(fetching || saving) && <CSpinner size="sm" />}

        {toast && (
          <span style={{
            fontSize: 13,
            color: '#2e7d32',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            ✓ Saved successfully
          </span>
        )}
      </div>

      <StandardGrid
        ref={gridRef}
        dataSource={filtered}
        keyExpr="id"
        noDataText={fetching ? 'Loading…' : 'No records.'}
        onEditingStart={() => setHasPendingChanges(true)}
        onSaving={(e) => {
          setHasPendingChanges(false)
          e.changes.forEach((change) => {
            if (change.type === 'update') {
              const original = (eggs ?? []).find((r) => r.id === change.key) ?? {}
              const updated = { ...original, ...change.data }
              dispatch(eggActions.updateRequest({ id: change.key, ...updated }))
            }
          })
        }}
      >
        <Editing
          mode="batch"
          allowUpdating={true}
          startEditAction="dblClick"
          selectTextOnEditStart={true}
        />
        <Column
          caption="#"
          width={50}
          allowSorting={false}
          allowFiltering={false}
          allowEditing={false}
          cellRender={({ rowIndex }) => rowIndex + 1}
        />
        <Column dataField="name" caption="Name" minWidth={120} />
        <Column
          dataField="date"
          caption="Date"
          dataType="date"
          width={150}
          defaultSortOrder="desc"
          customizeText={({ value }) =>
            value
              ? new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
              : ''
          }
        />
        <Column dataField="quantity" caption="Quantity" dataType="number" width={100} />
        <Column
          dataField="price"
          caption="Price"
          dataType="number"
          width={120}
          customizeText={({ value }) => (value != null ? fmt(value) : '')}
        />
        <Column
          name="totalCol"
          caption="Total"
          dataType="number"
          width={130}
          allowSorting={false}
          allowFiltering={false}
          calculateCellValue={(row) => (row.quantity != null && row.price != null ? row.quantity * row.price : null)}
          customizeText={({ value }) => (value != null ? fmt(value) : '')}
          setCellValue={(newData, value, currentRowData) => {
            const p = currentRowData.price
            const q = currentRowData.quantity
            if (p && p !== 0) {
              newData.quantity = value / p
            } else if (q && q !== 0) {
              newData.price = value / q
            }
          }}
        />
        <Summary
          calculateCustomSummary={(options) => {
            if (options.name !== 'grandTotal') return
            if (options.summaryProcess === 'start') options.totalValue = 0
            if (options.summaryProcess === 'calculate') {
              options.totalValue += (options.value?.quantity ?? 0) * (options.value?.price ?? 0)
            }
          }}
        >
          <TotalItem column="quantity" summaryType="sum" displayFormat="∑ {0}" />
          <TotalItem
            name="grandTotal"
            summaryType="custom"
            showInColumn="totalCol"
            customizeText={({ value }) => fmt(value)}
          />
        </Summary>

        <Column
          caption=""
          width={80}
          allowSorting={false}
          allowFiltering={false}
          allowEditing={false}
          cellRender={({ data }) => (
            <div style={{ display: 'flex', gap: 4 }}>
              <CButton
                size="sm"
                color="secondary"
                variant="ghost"
                onClick={() => openEdit(data)}
                title="Edit"
              >
                <CIcon icon={cilPencil} />
              </CButton>
              <CButton
                size="sm"
                color="danger"
                variant="ghost"
                onClick={() => handleDelete(data.id)}
                title="Delete"
              >
                <CIcon icon={cilTrash} />
              </CButton>
            </div>
          )}
        />
      </StandardGrid>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>{editingId ? 'Edit Egg' : 'New Egg'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Name
              </label>
              <input
                className="form-control form-control-sm"
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Egg name"
                autoFocus
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Date
              </label>
              <input
                className="form-control form-control-sm"
                type="date"
                value={form.date}
                onChange={set('date')}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Quantity
              </label>
              <input
                className="form-control form-control-sm"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleNumeric('quantity')}
                placeholder="0"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Price
              </label>
              <input
                className="form-control form-control-sm"
                type="number"
                min="0"
                value={form.price}
                onChange={handleNumeric('price')}
                placeholder="0"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Total
              </label>
              <input
                className="form-control form-control-sm"
                type="number"
                min="0"
                value={form.total}
                onChange={handleNumeric('total')}
                placeholder="0"
              />
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            disabled={saving || !form.name || !form.date || form.quantity === '' || form.price === ''}
            onClick={handleSubmit}
          >
            {saving ? <CSpinner size="sm" className="me-1" /> : null}
            {editingId ? 'Save changes' : 'Create'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
