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
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import * as eggActions from 'src/actions/cashflow/eggActions'

const today = () => new Date().toISOString().split('T')[0]
const EMPTY = { name: '', date: today(), quantity: '', price: '', total: '' }

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)

const fmtDate = (d) =>
  d
    ? new Date(d + 'T12:00:00').toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''

const fmtQty = (n) =>
  n != null ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 }).format(n) : ''

const lsGet = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const lsSet = (key, val) => localStorage.setItem(key, JSON.stringify(val))

// ── Egg card ──────────────────────────────────────────────────────────────────
function EggCard({ egg, currentPrice, onEdit, onDelete }) {
  const cp = parseFloat(currentPrice)
  const hasPL = currentPrice && !isNaN(cp) && egg.price != null && egg.quantity != null
  const pl = hasPL ? (cp - egg.price) * egg.quantity : null
  const total = egg.quantity != null && egg.price != null ? egg.quantity * egg.price : null
  const positive = pl >= 0

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '12px 14px',
        marginBottom: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        borderLeft: `4px solid ${pl === null ? '#dee2e6' : positive ? '#86efac' : '#fca5a5'}`,
      }}
    >
      {/* Row 1: name + P/L */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', flex: 1, marginRight: 8 }}>
          {egg.name}
        </div>
        {pl !== null && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: positive ? '#2f9e44' : '#e03131',
              flexShrink: 0,
            }}
          >
            {positive ? '▲' : '▼'} {fmt(Math.abs(pl))}
          </div>
        )}
      </div>

      {/* Row 2: date */}
      <div style={{ fontSize: 12, color: '#adb5bd', marginBottom: 8 }}>{fmtDate(egg.date)}</div>

      {/* Row 3: stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 4,
          background: '#f8f9fa',
          borderRadius: 8,
          padding: '8px 10px',
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: '#adb5bd', fontWeight: 600, marginBottom: 2 }}>
            CANTIDAD
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>
            {fmtQty(egg.quantity)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#adb5bd', fontWeight: 600, marginBottom: 2 }}>
            PRECIO
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>
            {egg.price != null ? fmt(egg.price) : '—'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#adb5bd', fontWeight: 600, marginBottom: 2 }}>
            TOTAL
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>
            {total != null ? fmt(total) : '—'}
          </div>
        </div>
      </div>

      {/* Row 4: actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onEdit(egg)}
          style={{
            flex: 1,
            padding: '7px',
            borderRadius: 8,
            border: '1px solid #dee2e6',
            background: '#fff',
            fontSize: 13,
            fontWeight: 600,
            color: '#1e3a5f',
            cursor: 'pointer',
          }}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onDelete(egg.id)}
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#fff5f5',
            fontSize: 13,
            color: '#e03131',
            cursor: 'pointer',
          }}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

// ── Global notes panel ────────────────────────────────────────────────────────
function GlobalNotes() {
  const [note, setNote] = useState(() => lsGet('eggs_note', ''))
  const [checked, setChecked] = useState(() => lsGet('eggs_checked', false))
  const [noteValue, setNoteValue] = useState(() => lsGet('eggs_noteValue', ''))
  const [noteQty, setNoteQty] = useState(() => lsGet('eggs_noteQty', ''))

  const handleNote = (e) => {
    setNote(e.target.value)
    lsSet('eggs_note', e.target.value)
  }
  const handleChecked = (e) => {
    setChecked(e.target.checked)
    lsSet('eggs_checked', e.target.checked)
  }
  const handleNoteValue = (e) => {
    setNoteValue(e.target.value)
    lsSet('eggs_noteValue', e.target.value)
  }
  const handleNoteQty = (e) => {
    setNoteQty(e.target.value)
    lsSet('eggs_noteQty', e.target.value)
  }

  return (
    <div
      style={{
        background: '#f8f9fa',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 14,
        border: '1px solid #e9ecef',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#6c757d',
          letterSpacing: '0.05em',
          marginBottom: 10,
        }}
      >
        NOTAS
      </div>

      {/* Note + check */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={note}
            onChange={handleNote}
            placeholder="Observación..."
            style={{
              flex: 1,
              border: 'none',
              borderBottom: '1px solid #dee2e6',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              color: '#1a1a2e',
              padding: '4px 0',
            }}
          />
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: checked ? '#2f9e44' : '#6c757d',
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={handleChecked}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#2f9e44' }}
            />
            {checked ? '✔ Check' : 'Check'}
          </label>
        </div>
      </div>

      {/* Value + quantity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: '#adb5bd', fontWeight: 600, marginBottom: 4 }}>
            VALOR
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={noteValue}
            onChange={handleNoteValue}
            placeholder="0"
            style={{
              width: '100%',
              border: 'none',
              borderBottom: '1px solid #dee2e6',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: 700,
              color: '#1e3a5f',
              padding: '2px 0 4px',
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#adb5bd', fontWeight: 600, marginBottom: 4 }}>
            CANTIDAD
          </div>
          <input
            type="number"
            min="0"
            step="0.000001"
            value={noteQty}
            onChange={handleNoteQty}
            placeholder="0"
            style={{
              width: '100%',
              border: 'none',
              borderBottom: '1px solid #dee2e6',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: 700,
              color: '#1a1a2e',
              padding: '2px 0 4px',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Eggs() {
  const dispatch = useDispatch()
  const { data: eggs, fetching, saving } = useSelector((s) => s.egg)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(false)
  const toastTimer = useRef(null)
  const prevSaving = useRef(false)

  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [currentPrice, setCurrentPrice] = useState(
    () => localStorage.getItem('eggs_currentPrice') ?? '',
  )
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('eggs_viewMode') ?? 'cards')

  const toggleViewMode = () => {
    const next = viewMode === 'cards' ? 'grid' : 'cards'
    setViewMode(next)
    localStorage.setItem('eggs_viewMode', next)
  }

  useEffect(() => {
    if (prevSaving.current && !saving) {
      setToast(true)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(false), 2500)
      setModalOpen(false)
    }
    prevSaving.current = saving
  }, [saving])

  useEffect(() => {
    dispatch(eggActions.fetchRequest())
  }, [dispatch])

  const years = useMemo(() => {
    if (!eggs) return []
    const set = new Set(eggs.map((e) => e.date?.slice(0, 4)).filter(Boolean))
    return [...set].sort((a, b) => b - a)
  }, [eggs])

  const filtered = useMemo(() => {
    if (!eggs) return []
    return [...eggs]
      .filter((e) => {
        const d = e.date ?? ''
        if (filterYear && !d.startsWith(filterYear)) return false
        if (filterMonth && d.slice(5, 7) !== filterMonth.padStart(2, '0')) return false
        return true
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }, [eggs, filterYear, filterMonth])

  // Summary
  const summary = useMemo(() => {
    const cp = parseFloat(currentPrice)
    const hasPL = !isNaN(cp) && !!currentPrice
    let totalInvested = 0,
      totalPL = 0,
      totalQty = 0
    let greenInvested = 0,
      greenPL = 0,
      greenQty = 0
    filtered.forEach((e) => {
      const qty = e.quantity ?? 0
      const price = e.price ?? 0
      totalInvested += qty * price
      totalQty += qty
      if (hasPL) {
        const pl = (cp - price) * qty
        totalPL += pl
        if (pl >= 0) {
          greenInvested += qty * price
          greenPL += pl
          greenQty += qty
        }
      }
    })
    return { totalInvested, totalPL, totalQty, hasPL, greenInvested, greenPL, greenQty }
  }, [filtered, currentPrice])

  const openCreate = () => {
    setForm(EMPTY)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (egg) => {
    const total =
      egg.quantity != null && egg.price != null ? (egg.quantity * egg.price).toFixed(2) : ''
    setForm({ name: egg.name, date: egg.date, quantity: egg.quantity, price: egg.price, total })
    setEditingId(egg.id)
    setModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este registro?')) dispatch(eggActions.deleteRequest({ id }))
  }

  const handleSubmit = () => {
    if (!form.name || !form.date || form.quantity === '' || form.price === '') return
    if (editingId) {
      dispatch(eggActions.updateRequest({ id: editingId, ...form }))
    } else {
      dispatch(eggActions.createRequest(form))
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
      if (field === 'total' && !isNaN(t) && !isNaN(p) && p !== 0) next.quantity = (t / p).toFixed(6)
      if (field === 'total' && !isNaN(t) && !isNaN(q) && q !== 0 && (isNaN(p) || p === 0))
        next.price = (t / q).toFixed(2)
      return next
    })
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const activeFilters = !!(filterYear || filterMonth)

  return (
    <div
      style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: '0 12px 40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 12px',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>Eggs 🥚</div>
          <div style={{ fontSize: 13, color: '#6c757d', marginTop: 2 }}>
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
            {activeFilters && ' · filtrado'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleViewMode}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '2px solid #dee2e6',
              background: '#fff',
              color: '#6c757d',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={viewMode === 'cards' ? 'Ver como tabla' : 'Ver como tarjetas'}
          >
            {viewMode === 'cards' ? '⊞' : '▤'}
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: `2px solid ${activeFilters ? '#1e3a5f' : '#dee2e6'}`,
              background: activeFilters ? '#eef4ff' : '#fff',
              color: activeFilters ? '#1e3a5f' : '#6c757d',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Filtros"
          >
            ⚙
          </button>
          <button
            onClick={openCreate}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Current price */}
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6c757d',
            display: 'block',
            marginBottom: 4,
            letterSpacing: '0.05em',
          }}
        >
          PRECIO ACTUAL
        </label>
        <input
          type="number"
          min="0"
          value={currentPrice}
          onChange={(e) => {
            setCurrentPrice(e.target.value)
            localStorage.setItem('eggs_currentPrice', e.target.value)
          }}
          placeholder="0"
          style={{
            width: '100%',
            border: 'none',
            borderBottom: '2px solid #1e3a5f',
            outline: 'none',
            background: 'transparent',
            fontSize: 22,
            fontWeight: 800,
            color: '#1e3a5f',
            padding: '4px 0 8px',
          }}
        />
      </div>

      {/* Global notes */}
      <GlobalNotes />

      {/* Filters panel */}
      {showFilters && (
        <div
          style={{
            background: '#f8f9fa',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6c757d',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                AÑO
              </label>
              <select
                className="form-select form-select-sm"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">Todos</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6c757d',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                MES
              </label>
              <select
                className="form-select form-select-sm"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">Todos</option>
                {[
                  'Enero',
                  'Febrero',
                  'Marzo',
                  'Abril',
                  'Mayo',
                  'Junio',
                  'Julio',
                  'Agosto',
                  'Septiembre',
                  'Octubre',
                  'Noviembre',
                  'Diciembre',
                ].map((m, i) => (
                  <option key={i} value={String(i + 1).padStart(2, '0')}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {activeFilters && (
            <button
              onClick={() => {
                setFilterYear('')
                setFilterMonth('')
              }}
              style={{
                marginTop: 10,
                fontSize: 12,
                color: '#e03131',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontWeight: 600,
              }}
            >
              × Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div
          style={{
            background: '#f8f9fa',
            borderRadius: 10,
            padding: '10px 12px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ fontSize: 10, color: '#adb5bd', fontWeight: 600, marginBottom: 3 }}>
            CANTIDAD
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e' }}>
            {new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 }).format(summary.totalQty)}
          </div>
        </div>
        <div
          style={{
            background: '#eef4ff',
            borderRadius: 10,
            padding: '10px 12px',
            border: '1px solid #c5d8ff',
          }}
        >
          <div style={{ fontSize: 10, color: '#6c757d', fontWeight: 600, marginBottom: 3 }}>
            INVERTIDO
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1e3a5f' }}>
            {fmt(summary.totalInvested)}
          </div>
        </div>
        {summary.hasPL && (
          <div
            style={{
              background: summary.totalPL >= 0 ? '#f0fdf4' : '#fff5f5',
              borderRadius: 10,
              padding: '10px 12px',
              border: `1px solid ${summary.totalPL >= 0 ? '#86efac' : '#fca5a5'}`,
            }}
          >
            <div style={{ fontSize: 10, color: '#6c757d', fontWeight: 600, marginBottom: 3 }}>
              P/L TOTAL
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: summary.totalPL >= 0 ? '#2f9e44' : '#e03131',
              }}
            >
              {summary.totalPL >= 0 ? '▲' : '▼'} {fmt(Math.abs(summary.totalPL))}
            </div>
          </div>
        )}
        {summary.hasPL && summary.greenQty > 0 && (
          <div
            style={{
              background: '#f0fdf4',
              borderRadius: 10,
              padding: '10px 12px',
              border: '1px solid #86efac',
            }}
          >
            <div style={{ fontSize: 10, color: '#2f9e44', fontWeight: 600, marginBottom: 3 }}>
              ● INVERTIDO EN VERDES
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#2f9e44' }}>
              {fmt(summary.greenInvested)}
            </div>
          </div>
        )}
        {summary.hasPL && summary.greenQty > 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#f0fdf4',
              borderRadius: 10,
              padding: '10px 12px',
              border: '1px solid #86efac',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: '#2f9e44', fontWeight: 600, marginBottom: 3 }}>
                  ● GANANCIA EN VERDES
                </div>
                <div style={{ fontSize: 11, color: '#adb5bd' }}>
                  {new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 }).format(
                    summary.greenQty,
                  )}{' '}
                  unidades
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#2f9e44' }}>
                ▲ {fmt(summary.greenPL)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {fetching && !eggs ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <CSpinner color="primary" />
        </div>
      ) : viewMode === 'grid' ? (
        <StandardGrid
          dataSource={filtered.map((e) => {
            const cp = parseFloat(currentPrice)
            const hasPL = !isNaN(cp) && !!currentPrice && e.price != null && e.quantity != null
            const pl = hasPL ? (cp - e.price) * e.quantity : null
            const total = e.quantity != null && e.price != null ? e.quantity * e.price : null
            return { ...e, pl, total }
          })}
          style={{ margin: 0 }}
        >
          <Column dataField="name" caption="Nombre" minWidth={120} />
          <Column dataField="date" caption="Fecha" dataType="date" width={110} />
          <Column
            dataField="quantity"
            caption="Cantidad"
            dataType="number"
            width={100}
            format={{ type: 'fixedPoint', precision: 6 }}
          />
          <Column
            dataField="price"
            caption="Precio"
            dataType="number"
            width={120}
            format={{ type: 'currency', currency: 'COP', precision: 0 }}
          />
          <Column
            dataField="total"
            caption="Total"
            dataType="number"
            width={130}
            format={{ type: 'currency', currency: 'COP', precision: 0 }}
          />
          {!!currentPrice && (
            <Column
              dataField="pl"
              caption="P/L"
              dataType="number"
              width={130}
              format={{ type: 'currency', currency: 'COP', precision: 0 }}
              cellRender={({ value }) =>
                value === null ? null : (
                  <span style={{ color: value >= 0 ? '#2f9e44' : '#e03131', fontWeight: 700 }}>
                    {value >= 0 ? '▲' : '▼'} {fmt(Math.abs(value))}
                  </span>
                )
              }
            />
          )}
          <Column
            caption=""
            width={90}
            cellRender={({ data }) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => openEdit(data)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 15,
                    color: '#1e3a5f',
                  }}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(data.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 15,
                    color: '#e03131',
                  }}
                  title="Eliminar"
                >
                  🗑
                </button>
              </div>
            )}
          />
        </StandardGrid>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#adb5bd', fontSize: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🥚</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin registros</div>
          <div>Presiona + para agregar</div>
        </div>
      ) : (
        filtered.map((egg) => (
          <EggCard
            key={egg.id}
            egg={egg}
            currentPrice={currentPrice}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e3a5f',
            color: '#fff',
            borderRadius: 20,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 2000,
          }}
        >
          ✓ Guardado correctamente
        </div>
      )}

      {/* Modal */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>{editingId ? 'Editar registro' : 'Nuevo registro'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                label: 'Nombre',
                field: 'name',
                type: 'text',
                placeholder: 'Ej: BTC compra',
                handler: set('name'),
              },
            ].map(({ label, field, type, placeholder, handler }) => (
              <div key={field}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  {label}
                </label>
                <input
                  className="form-control form-control-sm"
                  type={type}
                  value={form[field]}
                  onChange={handler}
                  placeholder={placeholder}
                  autoFocus={field === 'name'}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Fecha
              </label>
              <input
                className="form-control form-control-sm"
                type="date"
                value={form.date}
                onChange={set('date')}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'Cantidad', field: 'quantity', step: '0.000001' },
                { label: 'Precio', field: 'price', step: 'any' },
                { label: 'Total', field: 'total', step: 'any' },
              ].map(({ label, field, step }) => (
                <div key={field}>
                  <label
                    style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}
                  >
                    {label}
                  </label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    min="0"
                    step={step}
                    value={form[field]}
                    onChange={handleNumeric(field)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setModalOpen(false)}>
            Cancelar
          </CButton>
          <CButton
            color="primary"
            disabled={
              saving || !form.name || !form.date || form.quantity === '' || form.price === ''
            }
            onClick={handleSubmit}
          >
            {saving ? <CSpinner size="sm" className="me-1" /> : null}
            {editingId ? 'Guardar' : 'Crear'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
