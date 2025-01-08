import React, { useState, useEffect, Component } from 'react'
import { DataGrid, Editing, Column, MasterDetail, Selection, LoadPanel, Button as GButton } from 'devextreme-react/data-grid'
import { Button } from 'devextreme-react/button'
import { SelectControl, NewPaymentComponent } from './Controls'
import ItemDetail from './ItemDetail'
import ModalPaymentComponent  from './ModalPaymentComponent'
import { fetchAccounts, fetchAccountPayments, addAccountPayment } from './Services'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { cilX, cilCheckCircle } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import * as paymentActions from '../../../actions/paymentActions'
import * as accountActions from '../../../actions/accountActions'
import { bindActionCreators } from 'redux';
import { Notification } from './Alert';




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
  year: moment().format('Y'),
  month: moment().format('MMMM'),
  monthNumber: moment().format('M'),
  noEmptyAccounts: "true",
  type: "Outcoming",
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
    /*const filters = {
      noEmptyAccounts: "true",
      type: "Outcoming",
      year: "2024",
      month: "12"
    }*/
    this.refreshData()
  }

  refreshData = _ => {

    // console.log(this.state);
    this.props.actions.accounts.fetchData({ ...this.state, month: this.state.monthNumber })

  }
  selectAccount = (account) => {

    this.props.actions.accounts.selectAccount(account)

  }

  loadVauchers(item){

    console.log(item);
    const { key } = item
    const data = this.props.accounts?.data?.data?.items;
    const account = data.find( e => e.accountId == key );
    //console.log(account);
    //if (rowType == "data"){
    this.props.actions.accounts.loadVauchersToAccountPayment(account)

    //}

  }
  onChangeAnyState = (v, name) => {
    const { state } = this
    //console.log(name);

    if (name == "month") {

      this.setState({ ...state, "month": v, monthNumber: moment().month(v).format("M") })

    }
    else {

      this.setState({ ...state, [name]: v })

    }

  }

  addAccountPayment(item) {

    const { state, onChangeAnyState } = this
    const { data } = item.row

    this.setState({ ...state, showNewPaymentModal: true, currentAccount: data })
    //console.log(data);

  }

  render() {

    const data = this.props.accounts?.data?.data?.items;
    const { selectedAccount, isError: fetchIsError, error: fetchErrorMessage } = this.props.accounts;
    console.log(fetchErrorMessage);
    //console.log("selectedAccount");
    //console.log(selectedAccount);
    //console.log(this.props.accounts);

    const { onChangeAnyState, refreshData } = this;
    const { year, month, monthNumber } = this.state;
    const months = moment.months()
    const years = [(year - 1).toString(), year.toString(), (parseInt(year) + 1).toString()]

    let MyModal = <></>;
    if(selectedAccount){
      // MyModal = <h5>modal here {"test"}</h5>;
        MyModal = <ModalPaymentComponent account={selectedAccount} visible={typeof selectedAccount != "undefined"} name="showNewPaymentModal" setVisible={this.selectAccount} />
        //alert("ya va a existir")
    }

    return (
      <div>

        <Notification message={fetchErrorMessage} visible={fetchIsError} />
        {MyModal}


        <br />
        Period:
        <SelectControl title="Month" name="month" onChange={onChangeAnyState} value={month} options={months} />
        <SelectControl title="Year" name="year" onChange={onChangeAnyState} value={year} options={years} />

        <br />

        <Button text="Refresh Data" onClick={refreshData} />
        <DataGrid
          id="gridContainer"
          keyExpr="accountId"
          onSelectionChanged={onSelectionChanged}
          onContentReady={onContentReady}
          dataSource={data}
        onRowExpanded={ (e) => this.loadVauchers(e) }
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
          <Column dataField="Status"
            cellRender={cellData => {

              const { data } = cellData;
              const { payments } = data;
              if (payments) {

                const { total: payed } = payments;
                const { value: totalAmount } = data;
                //console.log(cellData);
                if (totalAmount <= payed) {
                  return <CIcon className="text-info" icon={cilCheckCircle} size="xl" />

                } else {
                  return <CIcon className="text-danger" icon={cilX} size="xl" />

                }

              } else {

                return <CIcon className="text-danger" icon={cilX} size="xl" />

              }

            }}
          />

          <Column type="buttons" caption="actions">
            <GButton
              name="add"
              onClick={(e) => this.selectAccount(e.row.data)}
            />
            <GButton name="edit" />
            <GButton name="delete" />
          </Column>

          <MasterDetail
          key={crypto.randomUUID()}
            autoExpandAll="false"
            enabled={false} render={(item) => ItemDetail(item.data, year, monthNumber, onChangeAnyState)} />

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


//export default App


const mapStateToProps = (state) => {
  //console.log(state)
    return {
      //isFetchingJunior: state.login.rest.fetching,
      accounts: state.account.state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: {
          //auth: bindActionCreators(authActions, dispatch),
            payments: bindActionCreators(paymentActions, dispatch),
            accounts: bindActionCreators(accountActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)


