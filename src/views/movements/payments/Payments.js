import React, { useState, useEffect, Component } from 'react'
import { DataGrid, Editing, Column, MasterDetail, Selection, LoadPanel, Button as GButton } from 'devextreme-react/data-grid'
import { Button } from 'devextreme-react/button'
import { SelectControl, NewPaymentComponent, VaucherModalViewer, ItemDetail } from './Controls'
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
  showNewPaymentModal: false,
  showModalVaucherViewer: false,
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
    console.log(name);

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

    this.setState({ ...state, showNewPaymentModal: true, currentAccount: data })
    console.log(data);

  }

  render() {

    /*useEffect(() => {
      fetchData()
    }, [])*/

    const { state, onChangeAnyState, fetchData } = this;
    const { data, year, month, monthNumber, showNewPaymentModal, currentAccount, showModalVaucherViewer } = state;
    const months = moment.months()
    const years = [(year-1).toString(), year.toString(), (year+1).toString()]
    console.log("showModalVaucherViewer");
    console.log(showModalVaucherViewer);

    return (
      <div>

        <NewPaymentComponent account={currentAccount} visible={showNewPaymentModal} name="showNewPaymentModal" setVisible={onChangeAnyState} />
        <VaucherModalViewer account={currentAccount} visible={showModalVaucherViewer} name="showModalVaucherViewer" setVisible={onChangeAnyState} />
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
          enabled={false} render={ (item) => ItemDetail(item, year, monthNumber, onChangeAnyState)} />

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
