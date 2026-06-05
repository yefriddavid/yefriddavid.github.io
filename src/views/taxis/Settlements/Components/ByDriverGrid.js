import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'

const ByDriverGrid = ({ byDriver, isCurrentPeriod, fmt, t }) => (
  <StandardGrid
    keyExpr="id"
    dataSource={byDriver}
    noDataText={t('taxis.settlements.noData')}
    summary={{
      totalItems: [
        { column: 'total', summaryType: 'sum', customizeText: (e) => fmt(e.value) },
        ...(isCurrentPeriod
          ? [{ column: 'remaining', summaryType: 'sum', customizeText: (e) => fmt(e.value) }]
          : []),
        ...(isCurrentPeriod
          ? [{
              column: 'count',
              summaryType: 'custom',
              name: 'grandTotal',
              showInColumn: 'count',
              customizeText: () =>
                `Gran total: ${fmt(byDriver.reduce((s, r) => s + r.total + r.remaining, 0))}`,
            }]
          : []),
      ],
      calculateCustomSummary: () => {},
    }}
  >
    <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={180} />
    <Column
      dataField="count"
      caption={t('taxis.settlements.columns.countSettlements')}
      width={140}
      cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{value}</span>}
    />
    <Column
      dataField="total"
      caption={t('taxis.settlements.columns.totalDeposited')}
      width={170}
      cellRender={({ value }) => (
        <span style={{ fontWeight: 700, color: '#1e40af' }}>{fmt(value)}</span>
      )}
    />
    <Column
      dataField="remaining"
      caption={t('taxis.settlements.columns.remaining')}
      width={170}
      visible={isCurrentPeriod}
      cellRender={({ data }) => (
        <span style={{ fontWeight: 700, color: data.remaining > 0 ? '#e67700' : '#2f9e44' }}>
          {fmt(data.remaining)}
        </span>
      )}
    />
    <MasterDetail
      enabled={true}
      render={({ data }) => (
        <div style={{ margin: '8px 8px 12px 32px' }}>
          <StandardGrid
            dataSource={data.rows}
            keyExpr="id"
            style={{ margin: 0 }}
            noDataText={t('taxis.settlements.noRecords')}
          >
            <Column
              dataField="date"
              caption={t('taxis.settlements.fields.date')}
              width={110}
              sortOrder="asc"
              defaultSortIndex={0}
            />
            <Column
              dataField="plate"
              caption={t('taxis.settlements.fields.plate')}
              width={100}
              cellRender={({ value }) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
              )}
            />
            <Column
              dataField="amount"
              caption={t('taxis.settlements.fields.value')}
              width={130}
              cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>}
            />
            <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} />
          </StandardGrid>
        </div>
      )}
    />
  </StandardGrid>
)

export default ByDriverGrid
