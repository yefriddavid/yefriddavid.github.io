import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import useLocaleData from 'src/hooks/useLocaleData'
import { useStickyAuditHeader } from 'src/hooks/useStickyAuditHeader'
import { runAuditAnalysis } from '../auditAnalysisRules'
import {
  AUDIT_COL_DEFS,
  AUDIT_COLS_LS_KEY,
  AUDIT_COLS_ORDER_LS_KEY,
  AUDIT_COLS_DEFAULT,
} from './auditConstants'

export const useAuditView = ({ weekdayFull, auditDays, dayFilter, periodDrivers }) => {
  const { t } = useTranslation()
  const { dayNames, dayNamesFull } = useLocaleData()
  const activeDayNames = weekdayFull ? dayNamesFull : dayNames
  const dispatch = useDispatch()
  const { fetching: settlementFetching } = useSelector((s) => s.taxiSettlement)

  const [loadingDay, setLoadingDay] = useState(null)
  const prevFetchingRef = useRef(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [auditPlateFilter, setAuditPlateFilter] = useState('')
  const [auditDriverFilter, setAuditDriverFilter] = useState(new Set())
  const [auditStatusFilter, setAuditStatusFilter] = useState(new Set())
  const [selectedAuditDay, setSelectedAuditDay] = useState(null)
  const [hoveredAuditDay, setHoveredAuditDay] = useState(null)
  const [addingSettlementDay, setAddingSettlementDay] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [selected, setSelected] = useState('edicion')
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)
  const theadRef = useRef(null)
  const scrollDivRef = useRef(null)
  const stickyScrollDivRef = useRef(null)
  const [stickyData] = useStickyAuditHeader(theadRef, scrollDivRef)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    if (!showColMgr) return
    const handler = (e) => {
      if (colMgrRef.current && !colMgrRef.current.contains(e.target)) setShowColMgr(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColMgr])

  useEffect(() => {
    if (prevFetchingRef.current && !settlementFetching) setLoadingDay(null)
    prevFetchingRef.current = settlementFetching
  }, [settlementFetching])

  const handleTableScroll = (e) => {
    if (stickyScrollDivRef.current) stickyScrollDivRef.current.scrollLeft = e.target.scrollLeft
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

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

  const dispatchCreate = (payload) => {
    setLoadingDay(payload.date)
    dispatch(taxiSettlementActions.createRequest(payload))
  }

  const openAnalysis = async () => {
    setShowAnalysis(true)
    setAnalysisLoading(true)
    const result = await runAuditAnalysis(auditDays, periodDrivers)
    setAnalysisResult(result)
    setAnalysisLoading(false)
  }

  const simulateDay = (day) => {
    const eligible = periodDrivers.filter((d) => {
      if (!d.defaultVehicle) return false
      if (d.startDate && d.startDate > day.dateStr) return false
      if (d.endDate && d.endDate < day.dateStr) return false
      if (day.picoPlacaVehicles?.includes(d.defaultVehicle)) return false
      if (auditDriverFilter.size > 0 && !auditDriverFilter.has(d.name)) return false
      return true
    })
    const total = eligible.reduce((s, d) => {
      const amount =
        day.isSunday || day.isHoliday
          ? d.defaultAmountSunday || d.defaultAmount || 0
          : d.defaultAmount || 0
      return s + amount
    }, 0)
    return { count: eligible.length, total }
  }

  const auditFilteredDays = auditDays.filter((day) => {
    if (dayFilter.size > 0 && !dayFilter.has(day.d)) return false
    if (auditStatusFilter.size > 0 && !auditStatusFilter.has(day.status)) return false
    if (
      auditPlateFilter &&
      !day.settledVehicles.includes(auditPlateFilter) &&
      !day.missingVehicles.includes(auditPlateFilter) &&
      !day.picoPlacaVehicles.includes(auditPlateFilter)
    )
      return false
    if (
      auditDriverFilter.size > 0 &&
      !day.settled.some((dr) => auditDriverFilter.has(dr)) &&
      !day.missing.some((dr) => auditDriverFilter.has(dr)) &&
      !day.picoPlacaDrivers.some((dr) => auditDriverFilter.has(dr))
    )
      return false
    return true
  })

  const hasFilters = auditPlateFilter || auditDriverFilter.size > 0 || auditStatusFilter.size > 0

  return {
    t,
    dispatch,
    activeDayNames,
    loadingDay,
    setLoadingDay,
    showInstructions,
    setShowInstructions,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    analysisLoading,
    auditPlateFilter,
    setAuditPlateFilter,
    auditDriverFilter,
    setAuditDriverFilter,
    auditStatusFilter,
    setAuditStatusFilter,
    selectedAuditDay,
    setSelectedAuditDay,
    hoveredAuditDay,
    setHoveredAuditDay,
    addingSettlementDay,
    setAddingSettlementDay,
    editingNote,
    setEditingNote,
    selected,
    setSelected,
    visibleCols,
    colOrder,
    draggedColRef,
    showColMgr,
    setShowColMgr,
    colMgrPos,
    setColMgrPos,
    colMgrRef,
    isFullscreen,
    containerRef,
    theadRef,
    scrollDivRef,
    stickyScrollDivRef,
    stickyData,
    handleTableScroll,
    toggleFullscreen,
    reorderCol,
    toggleCol,
    resetCols,
    col,
    colLabels,
    dispatchCreate,
    openAnalysis,
    simulateDay,
    auditFilteredDays,
    hasFilters,
  }
}
