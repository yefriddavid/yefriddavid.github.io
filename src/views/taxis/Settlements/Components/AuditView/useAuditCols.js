import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AUDIT_COL_DEFS,
  AUDIT_COLS_DEFAULT,
  AUDIT_COLS_LS_KEY,
  AUDIT_COLS_ORDER_LS_KEY,
} from './auditConstants'

export const useAuditCols = () => {
  const { t } = useTranslation()

  const [visibleCols, setVisibleCols] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIT_COLS_LS_KEY)
      return saved ? { ...AUDIT_COLS_DEFAULT, ...JSON.parse(saved) } : AUDIT_COLS_DEFAULT
    } catch {
      return AUDIT_COLS_DEFAULT
    }
  })
  const [colOrder, setColOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIT_COLS_ORDER_LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const valid = parsed.filter((k) => AUDIT_COL_DEFS.some((c) => c.key === k))
        const missing = AUDIT_COL_DEFS.filter((c) => !valid.includes(c.key)).map((c) => c.key)
        return [...valid, ...missing]
      }
    } catch {}
    return AUDIT_COL_DEFS.map((c) => c.key)
  })
  const draggedColRef = useRef(null)
  const [showColMgr, setShowColMgr] = useState(false)
  const [colMgrPos, setColMgrPos] = useState({ top: 0, left: 0 })
  const colMgrRef = useRef(null)

  useEffect(() => {
    if (!showColMgr) return
    const handler = (e) => {
      if (colMgrRef.current && !colMgrRef.current.contains(e.target)) setShowColMgr(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColMgr])

  const reorderCol = (fromKey, toKey) => {
    if (fromKey === toKey) return
    setColOrder((prev) => {
      const next = [...prev]
      const fromIdx = next.indexOf(fromKey)
      const toIdx = next.indexOf(toKey)
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, fromKey)
      localStorage.setItem(AUDIT_COLS_ORDER_LS_KEY, JSON.stringify(next))
      return next
    })
  }

  const toggleCol = (key) => {
    setVisibleCols((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(AUDIT_COLS_LS_KEY, JSON.stringify(next))
      return next
    })
  }

  const resetCols = () => {
    const all = Object.fromEntries(AUDIT_COL_DEFS.map((c) => [c.key, true]))
    setVisibleCols(all)
    localStorage.setItem(AUDIT_COLS_LS_KEY, JSON.stringify(all))
    const order = AUDIT_COL_DEFS.map((c) => c.key)
    setColOrder(order)
    localStorage.setItem(AUDIT_COLS_ORDER_LS_KEY, JSON.stringify(order))
  }

  const col = (key) => (visibleCols[key] ? {} : { display: 'none' })

  const colLabels = {
    weekday: t('taxis.settlements.audit.colWeekday'),
    status: t('taxis.settlements.audit.colStatus'),
    count: t('taxis.settlements.audit.colCount'),
    total: t('taxis.settlements.audit.colTotal'),
    cumul: 'Acum.',
    cumul_ideal: 'Acum. ideal',
    settled: t('taxis.settlements.audit.colSettled'),
    missing: t('taxis.settlements.audit.colMissing'),
    notes: 'Notas auditoría',
  }

  return {
    visibleCols,
    colOrder,
    draggedColRef,
    showColMgr,
    setShowColMgr,
    colMgrPos,
    setColMgrPos,
    colMgrRef,
    reorderCol,
    toggleCol,
    resetCols,
    col,
    colLabels,
  }
}
