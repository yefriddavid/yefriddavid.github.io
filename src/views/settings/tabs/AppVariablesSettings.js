import React, { useEffect, useState } from 'react'
import { CSpinner } from '@coreui/react'
import {
  getAppSettings,
  setAppSetting,
  SETTING_LABELS,
} from 'src/services/firebase/admin/appSettings'

export default function AppVariablesSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({}) // key → draft value
  const [saving, setSaving] = useState({}) // key → bool
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAppSettings()
      // Ensure known keys always appear even if not yet in Firebase
      const keys = Object.keys(SETTING_LABELS)
      const map = Object.fromEntries(data.map((s) => [s.key, s]))
      const merged = keys.map((k) => map[k] ?? { key: k, value: '' })
      setSettings(merged)
    } catch (e) {
      setError('Error al cargar variables.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleEdit = (key, value) => setEditing((prev) => ({ ...prev, [key]: value }))

  const handleSave = async (key) => {
    const value = editing[key]
    if (value === undefined) return
    setSaving((prev) => ({ ...prev, [key]: true }))
    try {
      await setAppSetting(key, value)
      setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
      setEditing((prev) => {
        const n = { ...prev }
        delete n[key]
        return n
      })
    } catch {
      alert('Error al guardar.')
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleCancel = (key) =>
    setEditing((prev) => {
      const n = { ...prev }
      delete n[key]
      return n
    })

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return <div style={{ color: '#e03131', padding: 16 }}>{error}</div>
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 16 }}>
        Variables globales de la aplicación almacenadas en Firebase. Los cambios aplican en tiempo
        real.
      </p>

      <div style={{ border: '1px solid #e9ecef', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
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
                        <CSpinner size="sm" style={{ width: 12, height: 12 }} />
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
