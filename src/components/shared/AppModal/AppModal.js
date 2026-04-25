import React, { useEffect, useRef } from 'react'
import { CSpinner } from '@coreui/react'
import './AppModal.scss'

/**
 * AppModal — branded modal wrapper for CashFlow.
 *
 * @param {boolean}    visible
 * @param {function}   onClose
 * @param {string}     title
 * @param {string}     [subtitle]
 * @param {ReactNode}  [icon]           — icon displayed left of the title
 * @param {'sm'|'md'|'lg'|'xl'} [size='md']
 * @param {'bottom'|'center'} [variant='bottom']
 * @param {ReactNode}  [children]       — modal body
 * @param {ReactNode}  [footer]         — replaces default footer buttons
 * @param {function}   [onConfirm]      — enables default footer
 * @param {string}     [confirmLabel='Guardar']
 * @param {boolean}    [confirmDisabled]
 * @param {boolean}    [confirmLoading]
 * @param {string}     [cancelLabel='Cancelar']
 * @param {boolean}    [danger]         — red confirm button
 * @param {boolean}    [hideCancel]     — hides cancel button in default footer
 */
export default function AppModal({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md',
  variant = 'bottom',
  children,
  footer,
  onConfirm,
  confirmLabel = 'Guardar',
  confirmDisabled = false,
  confirmLoading = false,
  cancelLabel = 'Cancelar',
  danger = false,
  hideCancel = false,
}) {
  const panelRef = useRef(null)
  const isCenter = variant === 'center'

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  // Close on Escape
  useEffect(() => {
    if (!visible) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [visible, onClose])

  if (!visible) return null

  const hasFooter = footer !== undefined || onConfirm !== undefined

  return (
    <div
      className={`app-modal-overlay app-modal-overlay--${variant}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className={`app-modal app-modal--${variant} app-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent stripe */}
        <div className="app-modal__stripe" aria-hidden="true" />

        {/* Drag handle — bottom only */}
        {!isCenter && <div className="app-modal__handle" aria-hidden="true" />}

        {/* Header */}
        {title && (
          <div className="app-modal__header">
            <div className="app-modal__header-main">
              {icon && <span className="app-modal__icon" aria-hidden="true">{icon}</span>}
              <div className="app-modal__titles">
                <h5 className="app-modal__title">{title}</h5>
                {subtitle && <p className="app-modal__subtitle">{subtitle}</p>}
              </div>
            </div>
            {isCenter && (
              <button
                className="app-modal__close-btn"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="app-modal__body">{children}</div>

        {/* Footer */}
        {hasFooter && (
          <div className="app-modal__footer">
            {footer ?? (
              <>
                {!hideCancel && (
                  <button
                    className="app-modal__btn app-modal__btn--cancel"
                    onClick={onClose}
                    disabled={confirmLoading}
                  >
                    {cancelLabel}
                  </button>
                )}
                <button
                  className={[
                    'app-modal__btn',
                    'app-modal__btn--confirm',
                    danger ? 'app-modal__btn--danger' : '',
                  ].join(' ').trim()}
                  onClick={onConfirm}
                  disabled={confirmDisabled || confirmLoading}
                >
                  {confirmLoading ? (
                    <CSpinner size="sm" className="app-modal__spinner" />
                  ) : (
                    confirmLabel
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
