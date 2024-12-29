import React, { useState, useEffect } from 'react';
import { DataGrid, Column, MasterDetail, Selection } from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import axios from 'axios'

const onContentReady = (e) => {
  if (!e.component.getSelectedRowKeys().length) { e.component.selectRowsByIndexes([0]); }
};

const onSelectionChanged = (e) => {
  e.component.collapseAll(-1);
  e.component.expandRow(e.currentSelectedRowKeys[0]);
};

  const renderItems = (rowData) => {
    const { data } = rowData
    // const data = JSON.stringify(rowData.data)
    // console.log(data)

    return (
      <ul>
        {data.name}
        <button>
          Vaucher
        </button>
      </ul>
    );
  };

const ItemDetail = (account) => {
  const [data, setData] = useState([])

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
      console.log(response.data.data)
      const payments = response.data.data?.payments?.items || []
      // const { items: payments } = data.payments
      //const { items } = data
      console.log(payments)

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

      //bodyFormData.append('year', '2024')
      //bodyFormData.append('month', '12')

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
        <Column dataField="type" />
        <Column dataField="paymentMethod" />
        <Column dataField="period" caption="Period" />

        <MasterDetail enabled={false} render={ItemDetail} />

      </DataGrid>
    </div>
  );
};

export default App;
