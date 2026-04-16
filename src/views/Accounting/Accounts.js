import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column } from 'devextreme-react/data-grid'
import { CButton, CCard, CCardBody, CCardHeader, CSpinner } from '@coreui/react'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import * as accountActions from 'src/actions/cashflow/accountActions'

const Accounts = () => {
  const dispatch = useDispatch()
  const { data: response, fetching } = useSelector((state) => state.account)

  // Extraemos los items de la respuesta del API (Google Apps Script)
  const items = response?.data?.items || []

  const fetchData = () => {
    dispatch(accountActions.fetchData({}))
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Listado de Cuentas</strong>
        <CButton
          color="primary"
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={fetching}
        >
          {fetching ? <CSpinner size="sm" /> : 'Refrescar'}
        </CButton>
      </CCardHeader>
      <CCardBody style={{ padding: 0 }}>
        <StandardGrid dataSource={items} keyExpr="accountId">
          <Column dataField="accountId" width={60} caption="#" />
          <Column dataField="name" minWidth={150} caption="Nombre" />
          <Column dataField="type" width={100} caption="Tipo" />
          <Column dataField="paymentMethod" width={140} caption="Método de Pago" />
          <Column dataField="period" width={100} caption="Período" />
          <Column
            dataField="value"
            caption="Valor"
            width={120}
            format={{ type: 'currency', precision: 0 }}
          />
        </StandardGrid>
      </CCardBody>
    </CCard>
  )
}

export default Accounts
