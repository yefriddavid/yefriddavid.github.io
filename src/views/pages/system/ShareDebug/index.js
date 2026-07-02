import React, { useCallback, useEffect, useState } from 'react'
import { CCard, CButton } from '@coreui/react'
import { Column, Paging } from 'devextreme-react/data-grid'
import CIcon from '@coreui/icons-react'
import { cilReload, cilExternalLink, cilCopy, cilBug } from '@coreui/icons'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import Spinner from 'src/components/shared/Spinner'
import { openDB, DB_STORES } from 'src/services/idb/db'
import './ShareDebug.scss'

const readStore = (storeName) =>
  openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)
        const keysReq = store.getAllKeys()
        const valuesReq = store.getAll()
        tx.oncomplete = () => {
          resolve(keysReq.result.map((key, i) => ({ key, value: valuesReq.result[i] })))
        }
        tx.onerror = () => reject(tx.error)
      }),
  )

const formatValue = (value) => {
  if (value && typeof value === 'object' && value.buffer instanceof ArrayBuffer) {
    return `imagen: ${value.name} · ${value.type} · ${value.buffer.byteLength} bytes`
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const ShareDebug = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    readStore(DB_STORES.APP_METADATA)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openImportView = () => {
    window.open(`/finance/management/account-status?share=${Date.now()}`, '_blank')
  }

  const copyContent = async () => {
    const rows = entries.map((e) => ({ key: e.key, value: formatValue(e.value) }))
    await navigator.clipboard.writeText(JSON.stringify(rows, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const renderValue = (data) => (
    <span className="sd__value-cell">{formatValue(data.data.value)}</span>
  )

  return (
    <div className="sd">
      <div className="sd__header">
        <div className="sd__header-left">
          <CIcon icon={cilBug} className="sd__header-icon" />
          <div>
            <h1 className="sd__title">Share Debug</h1>
            <span className="sd__subtitle">app_metadata — bridge de Web Share Target</span>
          </div>
        </div>
        <div className="sd__header-actions">
          <CButton color="secondary" variant="outline" size="sm" onClick={openImportView}>
            <CIcon icon={cilExternalLink} /> Abrir vista de importación
          </CButton>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={copyContent}
            disabled={!entries.length}
          >
            <CIcon icon={cilCopy} /> {copied ? 'Copiado ✓' : 'Copiar contenido'}
          </CButton>
          <CButton color="primary" variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Spinner size="sm" /> : <CIcon icon={cilReload} />} Recargar
          </CButton>
        </div>
      </div>

      <CCard className="sd__card">
        {loading ? (
          <Spinner mode="section" />
        ) : entries.length === 0 ? (
          <div className="sd__empty">Sin registros en app_metadata.</div>
        ) : (
          <StandardGrid dataSource={entries} keyExpr="key">
            <Paging enabled={false} />
            <Column dataField="key" caption="Key" width={220} />
            <Column dataField="value" caption="Valor" cellRender={renderValue} />
          </StandardGrid>
        )}
      </CCard>
    </div>
  )
}

export default ShareDebug
