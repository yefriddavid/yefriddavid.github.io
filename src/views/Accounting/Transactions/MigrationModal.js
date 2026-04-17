import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import * as transactionActions from 'src/actions/cashflow/transactionActions'
import { fetchAccounts } from 'src/services/api/accounts'
import { EXPENSE_CATEGORIES } from 'src/constants/cashFlow'
import { fmt, guessCategory, toISODate } from './helpers'

export default function MigrationModal({ onClose, onDone }) {
  const dispatch = useDispatch()
  const { importing, importProgress } = useSelector((s) => s.transaction)
  const [status, setStatus] = useState('idle')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)

  const prevImporting = React.useRef(importing)
  React.useEffect(() => {
    if (prevImporting.current && !importing) {
      setStatus('done')
      onDone()
    }
    prevImporting.current = importing
  }, [importing, onDone])

  const fetchLegacy = async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await fetchAccounts({
        month: 3,
        year: 2026,
        noEmptyAccounts: false,
        type: 'Outcoming',
      })
      const accounts = response?.data?.items ?? []
      const mapped = []
      accounts.forEach((account) => {
        const payments = account.payments?.items ?? []
        payments.forEach((payment) => {
          mapped.push({
            type: 'expense',
            category: guessCategory(account.name),
            description: account.name,
            amount: Number(payment.value || 0),
            date: toISODate(payment.date),
            _legacy_payment_id: payment.paymentId,
            _legacy_account_id: account.accountId,
          })
        })
      })
      setRows(mapped)
      setStatus('preview')
    } catch (e) {
      setError(e.message)
      setStatus('idle')
    }
  }

  const migrate = () => {
    setStatus('migrating')
    const items = rows.map(
      ({ _legacy_payment_id: _a, _legacy_account_id: _b, ...payload }) => payload,
    )
    dispatch(transactionActions.importRequest(items))
  }

  return (
    <CModal visible onClose={onClose} size="lg" alignment="center">
      <CModalHeader>
        <CModalTitle>Migrar datos de marzo (legado → Firebase)</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {status === 'idle' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--cui-secondary-color)', marginBottom: 20 }}>
              Esto traerá todos los pagos registrados en <b>marzo 2026</b> desde la API legacy y los
              importará como gastos en Firebase.
            </p>
            {error && <p style={{ color: '#e03131', marginBottom: 12 }}>{error}</p>}
            <CButton color="primary" onClick={fetchLegacy}>
              Obtener datos del legado
            </CButton>
          </div>
        )}

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CSpinner color="primary" />
            <p style={{ marginTop: 12 }}>Consultando API legacy…</p>
          </div>
        )}

        {status === 'preview' && (
          <>
            <p style={{ marginBottom: 12, fontSize: 13 }}>
              Se encontraron <b>{rows.length}</b> pagos. Revisa el mapeo antes de confirmar:
            </p>
            <div
              style={{
                maxHeight: 360,
                overflowY: 'auto',
                border: '1px solid var(--cui-border-color)',
                borderRadius: 6,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: '#1e3a5f', position: 'sticky', top: 0 }}>
                  <tr>
                    {['Fecha', 'Descripción', 'Categoría', 'Monto'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '7px 12px',
                          color: '#fff',
                          textAlign: 'left',
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: i % 2 === 0 ? '#fff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '6px 12px' }}>{r.date}</td>
                      <td style={{ padding: '6px 12px' }}>{r.description}</td>
                      <td style={{ padding: '6px 12px' }}>
                        <select
                          value={r.category}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((row, j) =>
                                j === i ? { ...row, category: e.target.value } : row,
                              ),
                            )
                          }
                          style={{
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid var(--cui-border-color)',
                          }}
                        >
                          {EXPENSE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '6px 12px', fontWeight: 600, color: '#e03131' }}>
                        {fmt(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <CButton color="secondary" variant="outline" onClick={onClose}>
                Cancelar
              </CButton>
              <CButton color="primary" onClick={migrate} disabled={rows.length === 0}>
                Importar {rows.length} registros a Firebase
              </CButton>
            </div>
          </>
        )}

        {status === 'migrating' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CSpinner color="primary" />
            <p style={{ marginTop: 12 }}>Guardando en Firebase… {importProgress}%</p>
            <div
              style={{
                background: '#f1f5f9',
                borderRadius: 8,
                height: 8,
                margin: '12px auto',
                maxWidth: 300,
              }}
            >
              <div
                style={{
                  background: '#1e3a5f',
                  height: '100%',
                  borderRadius: 8,
                  width: `${importProgress}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 700, color: '#2f9e44' }}>
              {rows.length} transacciones importadas exitosamente.
            </p>
            <CButton color="primary" onClick={onClose} style={{ marginTop: 12 }}>
              Cerrar
            </CButton>
          </div>
        )}
      </CModalBody>
    </CModal>
  )
}
