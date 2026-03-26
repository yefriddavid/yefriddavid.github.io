import React, { useState, useEffect } from 'react';
import { Column } from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import StandardGrid from 'src/components/StandardGrid'
import axios from 'axios'

const App = () => {
  const [data, setData] = useState([])

  const fetchData = async () => {
    try {
      const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

      var bodyFormData = new FormData()
      bodyFormData.append('token', localStorage.getItem('token'))
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
      <StandardGrid
        dataSource={data}
      >
        <Column dataField="accountId" width={60} caption="#" hidingPriority={3} />
        <Column dataField="name" minWidth={120} hidingPriority={5} />
        <Column dataField="type" hidingPriority={2} />
        <Column dataField="paymentMethod" hidingPriority={1} />
        <Column dataField="period" caption="Period" hidingPriority={4} />
      </StandardGrid>
    </div>
  );
};

export default App;
