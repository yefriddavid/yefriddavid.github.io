import React, { useEffect, useState, createRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
import { CTableHead, CTableRow, CTableHeaderCell, CTable, CTableBody, CTableDataCell } from '@coreui/react'
import { rgbToHex } from '@coreui/utils'
import { DocsLink } from 'src/components'
import axios from 'axios'

function JsonTable() {
  const [data, setData] = useState([])

  useEffect(() => {

      const fetchData = async () => {

      try {
        // const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec';
        const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

        var bodyFormData = new FormData()
        bodyFormData.append('token', '123-456-789')
        bodyFormData.append('action', 'getAccounts')
        bodyFormData.append('year', '2024')
        bodyFormData.append('month', '12')
        // bodyFormData.append('type', 'Incoming')
        bodyFormData.append('type', 'Outcoming')

        const response = await axios.post(url, bodyFormData)

        const { data } = response.data
        const { items } = data
        console.log(items)

        // const jsonData = await response.json()

        setData(items)

      } catch (error) {
        console.error('Error al obtener datos:', error)
      }
    }

    return fetchData()
  }, [])

  const elementItems = data.map( (i) =>
          <AccountItem key={i.accountId} account={i} />
  )

  console.log("end")
  // return (<div>pruebaaaa<div/>)
  return elementItems

}

const AccountItem = ({account: i}) => (
                  <CTableRow key={i.accountId}>
                    <CTableHeaderCell scope="row">{i.accountId}</CTableHeaderCell>
                    <CTableDataCell>{i.name}</CTableDataCell>
                    <CTableDataCell>{i.paymentMethod}</CTableDataCell>
                    <CTableDataCell>{i.period}</CTableDataCell>
                    <CTableDataCell>{i.value}</CTableDataCell>
                  </CTableRow>)



const Accounts = () => {
  const jsonData = [
    { id: 1, name: 'John Doe', value: 30000 },
    { id: 2, name: 'Jane Smith', value: 25000 },
    { id: 3, name: 'David Lee', value: 35000 },
  ]

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
                  <CTableHeaderCell scope="col">Payment Method</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Period</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Value</CTableHeaderCell>
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
