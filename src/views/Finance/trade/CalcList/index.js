import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EditableTable from 'src/components/shared/EditableTable'
import * as actions from 'src/actions/finance/calcListActions'
import { fmtUsd } from '../tradeUtils'
import './CalcList.scss'

const COLUMNS = [
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'quantity', label: 'Qty', type: 'number', width: 100 },
  { key: 'value', label: 'Value', type: 'number', width: 130, format: (v) => fmtUsd(v) },
  {
    key: 'total',
    label: 'Total',
    type: 'calc',
    width: 140,
    calc: (row) => (row.quantity || 0) * (row.value || 0),
    format: (v) => fmtUsd(v),
  },
]

export default function CalcList() {
  const dispatch = useDispatch()
  const rows = useSelector((s) => s.calcList.rows)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

  const handleChange = (id, field, value) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    dispatch(actions.saveRequest({ ...row, [field]: value }))
  }

  const handleAdd = () => {
    dispatch(actions.saveRequest({ id: crypto.randomUUID(), description: '', quantity: 1, value: 0 }))
  }

  const handleDelete = (id) => {
    dispatch(actions.deleteRequest(id))
  }

  return (
    <div className="calc-list">
      <p className="calc-list__title">Calc List</p>
      <EditableTable
        columns={COLUMNS}
        rows={rows}
        keyExpr="id"
        totalColumn="total"
        onRowChange={handleChange}
        onRowAdd={handleAdd}
        onRowDelete={handleDelete}
        emptyText="No hay filas. Agregá una con el botón de abajo."
      />
    </div>
  )
}
