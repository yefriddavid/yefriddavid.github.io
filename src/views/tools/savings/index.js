import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { Column, Paging } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import Spinner from 'src/components/shared/Spinner'
import AppModal from 'src/components/shared/AppModal'
import { fmt } from 'src/utils/formatters'
import * as actions from 'src/actions/finance/savingsActions'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import SavingsForm, { EMPTY_SAVING } from './SavingsForm'
import { monthKey, monthLabel, groupByMonth } from './savingsHelpers'
import './Savings.scss'

const Savings = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { savings, loading, saving } = useSelector((s) => s.savings)

  const [sheet, setSheet] = useState(null)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const sorted = useMemo(
    () => [...savings].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [savings],
  )

  const monthly = useMemo(() => groupByMonth(savings), [savings])

  const totals = useMemo(() => {
    const total = savings.reduce((acc, s) => acc + (Number(s.value) || 0), 0)
    const currentMonth = monthKey(new Date().toISOString().split('T')[0])
    const thisMonth = monthly.find((m) => m.key === currentMonth)?.total ?? 0
    const average = monthly.length ? total / monthly.length : 0
    return { total, thisMonth, average }
  }, [savings, monthly])

  const handleSave = (entry) => {
    if (entry.id) dispatch(actions.updateRequest(entry))
    else dispatch(actions.saveRequest(entry))
    setSheet(null)
  }

  const handleDelete = (entry) => {
    if (window.confirm(`¿Eliminar el ahorro del ${entry.date}?`))
      dispatch(actions.deleteRequest({ id: entry.id }))
  }

  return (
    <div className="sav-page">
      <div className="sav-header">
        <div>
          <div className="sav-header__title">Ahorros</div>
          <div className="sav-header__subtitle">{savings.length} registros</div>
        </div>
        <div className="sav-header__actions">
          <button className="sav-icon-btn sav-icon-btn--primary" onClick={() => setSheet('new')}>
            <CIcon icon={cilPlus} />
          </button>
        </div>
      </div>

      <div className="sav-summary">
        <div className="sav-summary__card">
          <div className="sav-summary__label">TOTAL AHORRADO</div>
          <div className="sav-summary__value">{fmt(totals.total)}</div>
        </div>
        <div className="sav-summary__card">
          <div className="sav-summary__label">ESTE MES</div>
          <div className="sav-summary__value">{fmt(totals.thisMonth)}</div>
        </div>
        <div className="sav-summary__card">
          <div className="sav-summary__label">PROMEDIO MENSUAL</div>
          <div className="sav-summary__value">{fmt(totals.average)}</div>
        </div>
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <>
          <div className="sav-section">
            <div className="sav-section__title">Desglose por mes</div>
            <StandardGrid dataSource={monthly} keyExpr="key">
              <Paging enabled={false} />
              <Column
                dataField="key"
                caption="Mes"
                calculateCellValue={(row) => monthLabel(row.key)}
              />
              <Column
                dataField="total"
                caption="Total ahorrado"
                dataType="number"
                alignment="right"
                calculateCellValue={(row) => row.total}
                customizeText={({ value }) => fmt(value)}
              />
              <Column dataField="count" caption="Registros" alignment="right" />
            </StandardGrid>
          </div>

          <div className="sav-section">
            <div className="sav-section__title">Registros</div>
            <StandardCard
              data={sorted}
              keyExpr="id"
              emptyText="Sin registros — toca + para agregar el primero."
              renderTitle={(s) => s.date}
              renderValue={(s) => fmt(s.value)}
              renderRows={(s) => [[s.comment && <span className={SC.muted}>{s.comment}</span>]]}
              renderActions={(s) => [
                { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => setSheet(s) },
                {
                  icon: cilTrash,
                  color: 'danger',
                  title: 'Eliminar',
                  onClick: () => handleDelete(s),
                },
              ]}
            />
          </div>
        </>
      )}

      <AppModal visible={!!sheet} onClose={() => setSheet(null)} variant="bottom" size="md">
        <SavingsForm
          initial={sheet === 'new' ? EMPTY_SAVING : sheet}
          onSave={handleSave}
          onCancel={() => setSheet(null)}
          saving={saving}
        />
      </AppModal>
    </div>
  )
}

export default Savings
