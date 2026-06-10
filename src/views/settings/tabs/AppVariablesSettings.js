import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as appSettingsActions from 'src/actions/system/appSettingsActions'
import { SETTING_LABELS } from 'src/constants/admin'
import Spinner from 'src/components/shared/Spinner'

export default function AppVariablesSettings() {
  const dispatch = useDispatch()
  const {
    data: settings,
    fetching: loading,
    saveSeq,
    lastSavedKey,
    saveError,
  } = useSelector((s) => s.appSettings)
  const [editing, setEditing] = useState({})
  const [saving, setSaving] = useState({})

  useEffect(() => {
    dispatch(appSettingsActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (!saveSeq) return
    setSaving((prev) => {
      const n = { ...prev }
      delete n[lastSavedKey]
      return n
    })
    setEditing((prev) => {
      const n = { ...prev }
      delete n[lastSavedKey]
      return n
    })
  }, [saveSeq]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!saveError) return
    setSaving({})
  }, [saveError])

  const handleEdit = (key, value) => setEditing((prev) => ({ ...prev, [key]: value }))

  const handleSave = (key) => {
    const value = editing[key]
    if (value === undefined) return
    setSaving((prev) => ({ ...prev, [key]: true }))
    dispatch(appSettingsActions.updateRequest({ key, value }))
  }

  const handleCancel = (key) =>
    setEditing((prev) => {
      const n = { ...prev }
      delete n[key]
      return n
    })

  if (loading && !settings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spinner color="primary" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 16 }}>
        Variables globales de la aplicación almacenadas en Firebase. Los cambios aplican en tiempo
        real.
      </p>

      {saveError && (
        <div style={{ color: '#e03131', padding: '8px 16px', marginBottom: 12, fontSize: 13 }}>
          Error al guardar: {saveError}
        </div>
      )}

      <div style={{ border: '1px solid #e9ecef', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 120px',
            padding: '8px 16px',
            background: '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
            fontSize: 11,
            fontWeight: 700,
            color: '#6c757d',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Variable</span>
          <span>Valor</span>
          <span />
        </div>

        {settings.map((s, idx) => {
          const isDirty = editing[s.key] !== undefined
          const isSaving = !!saving[s.key]
          const displayValue = isDirty ? editing[s.key] : s.value

          return (
            <div
              key={s.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 120px',
                padding: '12px 16px',
                alignItems: 'center',
                gap: 12,
                background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                borderBottom: idx < settings.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                  {SETTING_LABELS[s.key] ?? s.key}
                </div>
                <div
                  style={{ fontSize: 11, color: '#adb5bd', fontFamily: 'monospace', marginTop: 2 }}
                >
                  {s.key}
                </div>
              </div>

              <input
                type="text"
                value={displayValue}
                onChange={(e) => handleEdit(s.key, e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: isDirty ? '1px solid #1e3a5f' : '1px solid #dee2e6',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1a1a2e',
                  background: isDirty ? '#f0f4ff' : '#fff',
                  width: '100%',
                  outline: 'none',
                  transition: 'border 0.15s',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(s.key)
                  if (e.key === 'Escape') handleCancel(s.key)
                }}
              />

              <div style={{ display: 'flex', gap: 6 }}>
                {isDirty ? (
                  <>
                    <button
                      onClick={() => handleSave(s.key)}
                      disabled={isSaving}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#2f9e44',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isSaving ? (
                        <Spinner size="sm" style={{ width: 12, height: 12 }} />
                      ) : (
                        'Guardar'
                      )}
                    </button>
                    <button
                      onClick={() => handleCancel(s.key)}
                      disabled={isSaving}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #dee2e6',
                        background: '#fff',
                        color: '#6c757d',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: '#adb5bd' }}>
                    {s.updatedAt ? '✓ guardado' : 'sin valor'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
