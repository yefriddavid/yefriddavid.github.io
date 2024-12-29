import React, { useState, useEffect } from 'react';
import { DataGrid, Column } from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import axios from 'axios'

const App = () => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    try {
      const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

      var bodyFormData = new FormData()
      bodyFormData.append('token', '123-456-789')
      bodyFormData.append('action', 'getAccounts')

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
        dataSource={data}
        showBorders={true}
      >
        <Column dataField="accountId" width={70} caption="#" />
        <Column dataField="name" />
        <Column dataField="type" />
        <Column dataField="paymentMethod" />
        <Column dataField="period" caption="Period" />
      </DataGrid>
    </div>
  );
};

export default App;
