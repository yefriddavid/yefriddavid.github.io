import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { DocsLink } from 'src/components'
import axios from 'axios'

function JsonTable() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec';
        const url =
          'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

        const bodyFormData = new FormData()
        bodyFormData.append('token', localStorage.getItem('token'))
        bodyFormData.append('action', 'getAccounts')
        //bodyFormData.append('year', '2024')
        //bodyFormData.append('month', '12')
        // bodyFormData.append('type', 'Incoming')
        //bodyFormData.append('type', 'Outcoming')

        const response = await axios.post(url, bodyFormData)

        const { data } = response.data
        const { items } = data
        // const jsonData = await response.json()

        setData(items)
      } catch (error) {
        console.error('Error al obtener datos:', error)
      }
    }

    return fetchData()
  }, [])

  const elementItems = data.map((i) => <AccountItem key={i.accountId} account={i} />)

  // return (<div>pruebaaaa<div/>)
  return elementItems
}

const AccountItem = ({ account: i }) => (
  <CTableRow key={i.accountId}>
    <CTableHeaderCell scope="row">{i.accountId}</CTableHeaderCell>
    <CTableDataCell>{i.name}</CTableDataCell>
    <CTableDataCell>{i.type}</CTableDataCell>
    <CTableDataCell>{i.paymentMethod}</CTableDataCell>
    <CTableDataCell>{i.period}</CTableDataCell>
  </CTableRow>
)

const Accounts = () => {
  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          Accounts
          <DocsLink href="https://coreui.io/docs/utilities/colors/" />
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Payment Method</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Period</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <JsonTable />
              </CTableBody>
            </CTable>
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Accounts
