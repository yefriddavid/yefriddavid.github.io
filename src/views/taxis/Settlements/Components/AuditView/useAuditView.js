import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import useLocaleData from 'src/hooks/useLocaleData'
import { useStickyAuditHeader } from 'src/hooks/useStickyAuditHeader'
import { useAuditActions } from './useAuditActions'
import { useAuditCols } from './useAuditCols'
import { useAuditFilters } from './useAuditFilters'

export const useAuditView = ({ weekdayFull, auditDays, dayFilter, periodDrivers }) => {
  const { t } = useTranslation()
  const { dayNames, dayNamesFull } = useLocaleData()
  const activeDayNames = weekdayFull ? dayNamesFull : dayNames
  const dispatch = useDispatch()
  const { fetching: settlementFetching } = useSelector((s) => s.taxiSettlement)

  const [loadingDay, setLoadingDay] = useState(null)
  const prevFetchingRef = useRef(false)
  const [selectedAuditDay, setSelectedAuditDay] = useState(null)
  const [hoveredAuditDay, setHoveredAuditDay] = useState(null)
  const [addingSettlementDay, setAddingSettlementDay] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [selected, setSelected] = useState('edicion')

  const theadRef = useRef(null)
  const scrollDivRef = useRef(null)
  const stickyScrollDivRef = useRef(null)
  const stickyOverlayRef = useRef(null)
  const stickyTheadRef = useRef(null)
  useStickyAuditHeader(theadRef, scrollDivRef, stickyOverlayRef, stickyTheadRef)

  useEffect(() => {
    if (prevFetchingRef.current && !settlementFetching) setLoadingDay(null)
    prevFetchingRef.current = settlementFetching
  }, [settlementFetching])

  const handleTableScroll = (e) => {
    if (stickyScrollDivRef.current) stickyScrollDivRef.current.scrollLeft = e.target.scrollLeft
  }

  const dispatchCreate = (payload) => {
    setLoadingDay(payload.date)
    dispatch(taxiSettlementActions.createRequest(payload))
  }

  const filterHook = useAuditFilters({ auditDays, dayFilter, periodDrivers })
  const colHook = useAuditCols()
  const actionHook = useAuditActions({ auditDays, periodDrivers })

  return {
    t,
    dispatch,
    activeDayNames,
    loadingDay,
    setLoadingDay,
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
    theadRef,
    scrollDivRef,
    stickyScrollDivRef,
    stickyOverlayRef,
    stickyTheadRef,
    handleTableScroll,
    dispatchCreate,
    ...filterHook,
    ...colHook,
    ...actionHook,
  }
}
