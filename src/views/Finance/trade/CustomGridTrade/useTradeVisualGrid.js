import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as actions from 'src/actions/finance/customGridTradeActions'
import { SNAKE_X } from './gridConstants'
import { useGridFilters } from './useGridFilters'
import { useGridLevels } from './useGridLevels'
import { useGridPan } from './useGridPan'
import { useGridPnl } from './useGridPnl'

export const useTradeVisualGrid = ({ transactions, loanRate }) => {
  const dispatch = useDispatch()

  const [detailModal, setDetailModal] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const outerRef = useRef(null)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const levelHook = useGridLevels({ transactions })
  const panHook = useGridPan({
    viewTopPrice: levelHook.viewTopPrice,
    setViewTopPrice: levelHook.setViewTopPrice,
    H: levelHook.H,
    step: levelHook.step,
    LEVEL_H: levelHook.LEVEL_H,
  })
  const filterHook = useGridFilters({
    transactions,
    visibleTransactions: levelHook.visibleTransactions,
  })
  const pnlHook = useGridPnl({
    transactions,
    currentPrice: levelHook.currentPrice,
    loanRate,
    hiddenTrades: filterHook.hiddenTrades,
  })

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) outerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const closeDetailModal = () => {
    setDetailModal(null)
    setEditForm(null)
  }

  const saveDetailModal = () => {
    dispatch(
      actions.saveRequest({
        id: detailModal.id,
        price: Number(editForm.price),
        quantity: Number(editForm.quantity),
        fecha: editForm.fecha,
        notes: editForm.notes.trim(),
      }),
    )
    closeDetailModal()
  }

  return {
    ...levelHook,
    ...panHook,
    ...filterHook,
    ...pnlHook,
    detailModal,
    setDetailModal,
    editForm,
    setEditForm,
    isFullscreen,
    outerRef,
    SNAKE_X,
    toggleFullscreen,
    closeDetailModal,
    saveDetailModal,
  }
}
