import React, { useState, useEffect } from 'react';
import { DataGrid, Column, MasterDetail, Selection } from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import axios from 'axios'
import DocumentoFirebase from './test'

const onContentReady = (e) => {
  if (!e.component.getSelectedRowKeys().length) { e.component.selectRowsByIndexes([0]); }
};

const onSelectionChanged = (e) => {
  e.component.collapseAll(-1);
  e.component.expandRow(e.currentSelectedRowKeys[0]);
};

const ItemDetail = (account) => {
  const [data, setData] = useState([])
  const [load, setLoad] = useState([])

  const { data: itemAccount } = account

  const fetchData = async () => {
    try {
      const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

      var bodyFormData = new FormData()
      bodyFormData.append('token', '123-456-789')
      // bodyFormData.append('action', 'getAccounts')
      bodyFormData.append('action', 'getAccountPayments')
      bodyFormData.append('accountId', itemAccount.accountId)

      bodyFormData.append('year', '2024')
      bodyFormData.append('month', '12')

      const response = await axios.post(url, bodyFormData)

      // console.log(response.data.data.payments)
      //console.log(response.data.data)
      const payments = response.data.data?.payments?.items || []
      // const { items: payments } = data.payments
      //const { items } = data
      //console.log(payments)

      setLoad(true)
      setData(payments)
    } catch (error) {
      console.error('Error loading jQuery:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

    // const data = JSON.stringify(rowData.data)
    // console.log(data)

    const comment = data.length ? data[0].comment : "";
    const value = data.length ? data[0].value : "";

  console.log(data);
console.log("data:");

  if(load !== true){
    return <center>
      <h5>Loading...</h5>
    </center>

  }

  const myPayments = data || [];
  if(!myPayments.length){
    return <center>
      <h5>No payments yet...</h5>
    </center>

  }
  return myPayments.map( (i) =>
        <div key={i.paymentId}>
        ID: {i.paymentId} <br />
        comment: {i.comment} <br />
        value: {i.value} <br />
        <br />
  <DocumentoFirebase paymentId={i.paymentId} />
        <br />
        <button>
          Vaucher
        </button>
        <hr />
    </div>
   )
    return (
      <ul>
        comment: {comment} <br />
        value: {value} <br />
        <br />
        <button>
          Vaucher
        </button>
      </ul>
    );

  return (
    <div>
      david rios
    </div>
  );
};


const App = () => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    try {
      const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

      var bodyFormData = new FormData()
      bodyFormData.append('token', '123-456-789')
      bodyFormData.append('action', 'getAccounts')
      bodyFormData.append('type', 'Outcoming')

      bodyFormData.append('year', '2024')
      bodyFormData.append('month', '12')
      bodyFormData.append('noEmptyAccounts', 'true')

      const response = await axios.post(url, bodyFormData)

      const { data } = response.data
      const { items } = data
      console.log(items)

      setData(items)
    } catch (error) {
      console.error('Error loading jQuery:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div>
      Period:
      <br />
      year:
      <select>
        <option value="2025">
          2025
        </option>
        <option value="2024">
          2024
        </option>
      </select>
      <br />
      Month:
      <select month="month">
        <option value="1">
          January
        </option>
        <option value="11">
          November
        </option>
        <option value="12">
          December
        </option>
      </select>
      <br />
      <br />

      <Button text="Refresh Data" onClick={fetchData} />
      <DataGrid
        id="gridContainer"
      keyExpr="accountId"
          onSelectionChanged={onSelectionChanged}
    onContentReady={onContentReady}
        dataSource={data}
        showBorders={true}
      >
            <Selection mode="single" />

        <Column dataField="accountId" width={70} caption="#" />
        <Column dataField="name" />
        <Column dataField="paymentMethod" />
        <Column dataField="period" caption="Period" />
        <Column dataField="value" caption="Value" />

        <MasterDetail enabled={false} render={ItemDetail} />

      </DataGrid>
    </div>
  );
};

export default App;
