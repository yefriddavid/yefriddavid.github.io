import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CButton } from '@coreui/react'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow } from 'devextreme-react/data-grid'
import Spinner from 'src/components/shared/Spinner'
import { configure as configureFacade } from 'src/services/facade/domotica/domoticaSolarCalcFacade'
import * as actions from 'src/actions/domotica/domoticaSolarCalcActions'

const MODE_LABEL = {
  from_system: 'Sistema → Consumo',
  from_consumption: 'Consumo → Sistema',
}

export default function SolarCalculatorConfigs() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: configs, fetching } = useSelector((s) => s.domoticaSolarCalc)

  useEffect(() => {
    configureFacade('remote')
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleNew = () => navigate('/domotica/solar-calculator')
  const handleLoad = (id) => navigate(`/domotica/solar-calculator?id=${id}`)
  const handleDelete = (id) => dispatch(actions.deleteRequest({ id }))

  if (fetching && !configs) return <Spinner mode="section" />

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h5 style={{ margin: 0 }}>Configuraciones — Calculadora Solar</h5>
        <CButton color="primary" size="sm" onClick={handleNew}>+ Nueva configuración</CButton>
      </div>

      <StandardGrid
        dataSource={configs ?? []}
        keyExpr="id"
        onRowClick={(e) => handleLoad(e.data.id)}
        style={{ cursor: 'pointer' }}
      >
        <Paging defaultPageSize={20} />
        <FilterRow visible />
        <Column dataField="name" caption="Nombre" />
        <Column
          dataField="mode"
          caption="Modo"
          width={180}
          calculateCellValue={(r) => MODE_LABEL[r.mode] ?? r.mode}
        />
        <Column
          caption="Paneles"
          width={100}
          calculateCellValue={(r) => r.panels ? `${r.panels.count} × ${r.panels.wp}Wp` : '—'}
        />
        <Column
          caption="Baterías"
          width={110}
          calculateCellValue={(r) => r.battery ? `${r.battery.count} × ${r.battery.ah}Ah` : '—'}
        />
        <Column
          caption="HSP"
          width={70}
          calculateCellValue={(r) => r.panels?.hsp ?? '—'}
        />
        <Column
          caption="Ubicación"
          calculateCellValue={(r) => r.location?.name ?? '—'}
        />
        <Column
          caption=""
          width={80}
          cellRender={({ data }) => (
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleDelete(data.id) }}
            >
              Eliminar
            </CButton>
          )}
        />
      </StandardGrid>
    </div>
  )
}
