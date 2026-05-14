import React, { useState, useCallback } from 'react'
import AppModal from 'src/components/shared/AppModal/AppModal'

/**
 * A hook to handle delete confirmations using a custom modal.
 *
 * @returns {Object} { confirm, ConfirmDialog }
 *
 * @example
 * const { confirm, ConfirmDialog } = useConfirmDelete()
 * const handleDelete = async (item) => {
 *   if (await confirm(`¿Eliminar "${item.name}"?`)) {
 *     // perform delete
 *   }
 * }
 * // In render:
 * <ConfirmDialog />
 */
const useConfirmDelete = () => {
  const [state, setState] = useState({
    visible: false,
    title: 'Confirmar eliminación',
    message: '',
    resolve: null,
  })

  const confirm = useCallback((message, title = 'Confirmar eliminación') => {
    return new Promise((resolve) => {
      setState({
        visible: true,
        title,
        message,
        resolve,
      })
    })
  }, [])

  const handleClose = () => {
    state.resolve?.(false)
    setState((s) => ({ ...s, visible: false }))
  }

  const handleConfirm = () => {
    state.resolve?.(true)
    setState((s) => ({ ...s, visible: false }))
  }

  const ConfirmDialog = () => (
    <AppModal
      visible={state.visible}
      onClose={handleClose}
      title={state.title}
      variant="center"
      size="sm"
      onConfirm={handleConfirm}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      danger
    >
      <div style={{ padding: '4px 0' }}>
        <p style={{ margin: 0, fontWeight: 500 }}>{state.message}</p>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--cui-secondary-color)' }}>
          Esta acción no se puede deshacer.
        </p>
      </div>
    </AppModal>
  )

  return { confirm, ConfirmDialog }
}

export default useConfirmDelete
