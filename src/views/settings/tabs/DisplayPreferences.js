import React, { useState } from 'react'

const PREFS = [
  {
    key: 'settlements_weekdayFull',
    label: 'Nombre del día en liquidaciones',
    description: 'Controla si el día de la semana se muestra abreviado (Mié) o completo (Miércoles)',
    type: 'toggle',
    options: [
      { value: 'false', label: 'Abreviado' },
      { value: 'true', label: 'Completo' },
    ],
    defaultValue: 'false',
  },
]

export default function DisplayPreferences() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      PREFS.map((p) => [p.key, localStorage.getItem(p.key) ?? p.defaultValue]),
    ),
  )

  const handleChange = (key, value) => {
    localStorage.setItem(key, value)
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 16 }}>
        Preferencias de visualización almacenadas localmente en el navegador.
      </p>

      <div style={{ border: '1px solid #e9ecef', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
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
          <span>Preferencia</span>
          <span>Valor</span>
        </div>

        {PREFS.map((pref, idx) => (
          <div
            key={pref.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              padding: '14px 16px',
              alignItems: 'center',
              gap: 16,
              background: idx % 2 === 0 ? '#fff' : '#fafbfc',
              borderBottom: idx < PREFS.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{pref.label}</div>
              <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 2 }}>{pref.description}</div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {pref.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange(pref.key, opt.value)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: values[pref.key] === opt.value ? '#1e3a5f' : '#dee2e6',
                    background: values[pref.key] === opt.value ? '#1e3a5f' : '#fff',
                    color: values[pref.key] === opt.value ? '#fff' : '#6c757d',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
