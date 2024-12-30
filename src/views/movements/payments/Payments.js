import React, { useState, useEffect, Component } from 'react'
import { DataGrid, Editing, Column, MasterDetail, Selection, LoadPanel, Button as GButton } from 'devextreme-react/data-grid'
import { Button } from 'devextreme-react/button'
import { VaucherControlViewer } from './Database'
import { SelectControl, NewPaymentComponent } from './Controls'
import { fetchAccounts, fetchAccountPayments, addAccountPayment } from './Services'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
//import { Controller, useFormContext } from "react-hook-form"
import moment from 'moment'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPopover,
  CRow,
  CTooltip,
} from '@coreui/react'

const initialState = {
  showModal: false,
  response: {},
  data: null,
  year: moment().format('Y'),
  month: moment().format('MMMM'),
  monthNumber: moment().format('M'),
  // monthNumber: "10",
}

const onContentReady = (e) => {
  if (!e.component.getSelectedRowKeys().length) { e.component.selectRowsByIndexes([0]); }
}

const onSelectionChanged = (e) => {
  e.component.collapseAll(-1)
  e.component.expandRow(e.currentSelectedRowKeys[0])
}

const ItemDetail = (account, year, month) => {
  const [data, setData] = useState([])
  const [load, setLoad] = useState([])

  const { data: itemAccount } = account
  // const { year, monthNumber,  } = this.state

  const fetchData = async () => {
    try {

      const accounts = await fetchAccountPayments({year, month, accountId: itemAccount.accountId})

      const payments = accounts.data?.payments?.items || []

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


  if (load !== true) {
    return <center>
      <h5>Loading...</h5>
    </center>

  }

  const myPayments = data || [];
  if (!myPayments.length) {
    return <center>
      <h5>No payments yet...</h5>
    </center>

  }
  return myPayments.map((i) =>
    <div key={i.paymentId}>
      ID: {i.paymentId} <br />
      comment: {i.comment} <br />
      value: {i.value} <br />
      <br />
      <VaucherControlViewer paymentId={i.paymentId} />
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


class App extends Component {
  state = {
    ...initialState
  }
  setDefaultState = () => {
    this.setState({
      ...initialState
    });
  }
  componentDidMount() {
    this.fetchData()
  }
  onChangeAnyState = (v, name) => {
    const { state } = this

    if (name=="month") {

      this.setState({ ...state, "month": v, monthNumber: moment().month(v).format("M") })

    }
    else {

      this.setState({ ...state, [name]: v })

    }

  }


  fetchData = async () => {

    const { state } = this
    const { year, monthNumber: month } = state
    console.log("fetch data", month);

    //this.onChangeAnyState(true, "loading")

    //this.setState({...state, data: null })
      this.onChangeAnyState(null, "data")
    try {

      const response = await fetchAccounts({year, month,
        type: 'Outcoming',
        'noEmptyAccounts': 'true'})

      const { data, parametres } = response
      const { items: accounts } = data

      //this.onChangeAnyState(items, "data")
      this.onChangeAnyState(accounts, "data")
      //this.onChangeAnyState({ parameters }, "response")
      //this.setState({...state, data: accounts, response: { parametres } })
      //this.setState({...this.state, data: items)

      //this.onChangeAnyState(false, "loading")
    } catch (error) {
      console.error('Error loading jQuery:', error)
    }
  }

  addAccountPayment(item){

    const { state, onChangeAnyState } = this
    const { data } = item.row

    this.setState({ ...state, showModal: true, currentAccount: data })
    console.log(data);

  }

  render() {

    /*useEffect(() => {
      fetchData()
    }, [])*/

    const { state, onChangeAnyState, fetchData } = this;
    const { data, year, month, monthNumber, showModal, currentAccount } = state;
    const months = moment.months()
    const years = [(year-1).toString(), year.toString(), (year+1).toString()]

    return (
      <div>

        <NewPaymentComponent account={currentAccount} visible={showModal} setVisible={onChangeAnyState} />
        <br />
        Period:
        <SelectControl title="Month" name="month" onChange={onChangeAnyState} value={month} options={months} />
        <SelectControl title="Year" name="year" onChange={onChangeAnyState} value={year} options={years} />

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
                <Editing
                    allowUpdating={true}
                    allowDeleting={true}
                />
          <Column dataField="accountId" width={70} caption="#" />
          <Column dataField="name" />
          <Column dataField="paymentMethod" />
          <Column dataField="period" caption="Period" />
          <Column dataField="value" caption="Value" />
          <Column type="buttons" caption="actions">
                <GButton
                    name="add"
                onClick={(e) => this.addAccountPayment(e) }
                />
                  <GButton name="edit" />
        <GButton name="delete" />
                </Column>

          <MasterDetail
          autoExpandAll = "false"
          enabled={false} render={ (item) => ItemDetail(item, year, monthNumber)} />

          <LoadPanel
          visible={!data}
                enabled="true"
                height={100}
                width={250}
                indicatorSrc1="https://js.devexpress.com/Content/data/loadingIcons/rolling.svg"
            />

        </DataGrid>
      </div>
    );
  }
}


export default App
