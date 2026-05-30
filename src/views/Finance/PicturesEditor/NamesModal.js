import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CModalTitle } from '@coreui/react'
import { PICTURE_NAMES } from 'src/constants/pictureNames'

const NamesModal = ({ visible, onClose, onSelect }) => {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)

  const filtered = PICTURE_NAMES.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase()),
  )

  const handleClick = (name) => {
    navigator.clipboard.writeText(name).catch(() => {})
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
    onSelect(name)
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg" alignment="center" scrollable>
      <CModalHeader>
        <CModalTitle>Nombres para pinturas</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <input
          autoFocus
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: '6px 10px', border: '1px solid #ced4da', borderRadius: 6, fontSize: 13 }}
        />

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>#</th>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Nombre</th>
              <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#495057' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((name, i) => (
              <tr
                key={name}
                style={{ borderBottom: '1px solid #f0f0f0', background: copied === name ? '#e8f5e9' : 'transparent', transition: 'background 0.2s' }}
              >
                <td style={{ padding: '5px 10px', color: '#adb5bd', width: 36 }}>
                  {PICTURE_NAMES.indexOf(name) + 1}
                </td>
                <td style={{ padding: '5px 10px', fontWeight: 500 }}>{name}</td>
                <td style={{ padding: '5px 10px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleClick(name)}
                    style={{
                      background: copied === name ? '#198754' : '#0d6efd',
                      border: 'none', borderRadius: 5, color: '#fff',
                      cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      padding: '3px 12px', transition: 'background 0.2s',
                    }}
                  >
                    {copied === name ? '✓ Copiado' : 'Usar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: 20, textAlign: 'center', color: '#adb5bd' }}>
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 10, fontSize: 11, color: '#adb5bd', textAlign: 'right' }}>
          {filtered.length} de {PICTURE_NAMES.length} nombres
        </div>
      </CModalBody>
    </CModal>
  )
}

export default NamesModal
