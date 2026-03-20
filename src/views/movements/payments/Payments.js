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
import { withTranslation } from 'react-i18next'
import { Notification } from './Alert';
import './Payments.scss'

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
  CSpinner,
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

class App extends Component {
  state = {
    ...initialState,
    expandedRowKey: null,
    cachedData: null,
    isFetching: false,
  }

  // ── Cache helpers ───────────────────────────────────────────────
  getCacheKey() {
    const { year, monthNumber } = this.state
    return `payments_cache_${year}_${monthNumber}`
  }

  loadCache() {
    try {
      const raw = localStorage.getItem(this.getCacheKey())
      if (raw) this.setState({ cachedData: JSON.parse(raw) })
    } catch {}
  }

  saveCache(items) {
    try {
      localStorage.setItem(this.getCacheKey(), JSON.stringify(items))
    } catch {}
  }

  // ── Lifecycle ───────────────────────────────────────────────────
  componentDidMount() {
    this.loadCache()
    this.refreshData()
  }

  componentDidUpdate(prevProps) {
    const newData = this.props.accounts?.data?.data?.items
    const prevData = prevProps.accounts?.data?.data?.items
    if (newData && newData !== prevData) {
      this.saveCache(newData)
      this.setState({ isFetching: false })
    }
  }

  onRowClick = (e) => {
    if (e.rowType !== 'data') return
    const { expandedRowKey } = this.state
    const clickedKey = e.key

    if (expandedRowKey === clickedKey) {
      e.component.collapseAll(-1)
      this.setState({ expandedRowKey: null })
    } else {
      e.component.collapseAll(-1)
      e.component.expandRow(clickedKey)
      this.setState({ expandedRowKey: clickedKey })
    }
  }

  setDefaultState = () => {
    this.setState({ ...initialState })
  }

  refreshData = () => {
    this.setState({ isFetching: true })
    this.props.actions.accounts.fetchData({ ...this.state, month: this.state.monthNumber })
  }
  selectAccount = (account) => {

    this.props.actions.accounts.selectAccount(account)

  }

  loadVauchers(item){

    console.log(item);
    const { key } = item
    const data = this.props.accounts?.data?.data?.items;
    if (!data) return;
    const account = data.find( e => e.accountId == key );
    //console.log(account);
    //if (rowType == "data"){
    this.props.actions.accounts.loadVauchersToAccountPayment(account)

    //}

  }
  onChangeAnyState = (v, name) => {
    const { state } = this
    const newState = name === 'month'
      ? { ...state, month: v, monthNumber: moment().month(v).format('M') }
      : { ...state, [name]: v }

    this.setState(newState, () => this.loadCache())
  }

  addAccountPayment(item) {

    const { state, onChangeAnyState } = this
    const { data } = item.row

    this.setState({ ...state, showNewPaymentModal: true, currentAccount: data })
    //console.log(data);

  }

  render() {
    const { t } = this.props
    const reduxData = this.props.accounts?.data?.data?.items;
    const { selectedAccount, isError: fetchIsError, error: fetchErrorMessage } = this.props.accounts;
    const { cachedData, isFetching, year, month, monthNumber } = this.state;
    const data = reduxData ?? cachedData;

    const { onChangeAnyState, refreshData } = this;
    const months = moment.months()
    const years = [(year - 1).toString(), year.toString(), (parseInt(year) + 1).toString()]

    let MyModal = <></>;
    if(selectedAccount){
        MyModal = <ModalPaymentComponent account={selectedAccount} visible={typeof selectedAccount != "undefined"} name="showNewPaymentModal" setVisible={this.selectAccount} />
    }

    return (
      <div>

        <Notification message={fetchErrorMessage} visible={fetchIsError} />
        {MyModal}

        <div className="payments-filters">
          <SelectControl title={t('payments.filters.month')} name="month" onChange={onChangeAnyState} value={month} options={months} />
          <SelectControl title={t('payments.filters.year')} name="year" onChange={onChangeAnyState} value={year} options={years} />
          <Button text={t('common.refresh')} onClick={refreshData} type="default" stylingMode="contained" />
          {isFetching && data && (
            <div className="payments-fetching">
              <CSpinner size="sm" color="primary" />
              <span>{t('common.updating')}</span>
            </div>
          )}
        </div>

        {!data ? (
          <div className="payments-loading">
            <CSpinner color="primary" />
            <span>{t('common.loading')}</span>
          </div>
        ) : <DataGrid
          id="paymentsGrid"
          className="payments-grid"
          keyExpr="accountId"
          onContentReady={onContentReady}
          onRowClick={this.onRowClick}
          dataSource={data}
          onRowExpanded={(e) => this.loadVauchers(e)}
          showBorders={true}
          columnAutoWidth={true}
          columnHidingEnabled={false}
          allowColumnResizing={true}
          rowAlternationEnabled={true}
          hoverStateEnabled={true}
        >
          <Selection mode="single" />
          <Editing
            allowUpdating={true}
            allowDeleting={true}
          />
          <Column dataField="accountId" width={70} caption={t('payments.columns.id')} />
          <Column dataField="name" width={320} caption={t('payments.columns.name')} />
          <Column dataField="maxDate" width={120} caption={t('payments.columns.dueDate')} />
          <Column dataField="paymentMethod" caption={t('payments.columns.paymentMethod')} allowEditing={false} />
          <Column dataField="period" caption={t('payments.columns.period')} />
          <Column caption="Fecha" width={110} allowEditing={false}
            cellRender={({ data }) => {
              const items = data?.payments?.items
              if (!items?.length) return null
              const last = items.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b)
              return <span>{moment(last.date).format('MMM DD, YYYY')}</span>
            }}
          />
          <Column dataField="value" caption={t('payments.columns.value')}
            cellRender={({ value }) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)}
          />
          <Column dataField="Status" width={90} alignment="center" caption={t('payments.columns.status')} allowEditing={false}
            cellRender={cellData => {
              const { data } = cellData;
              const { payments } = data;
              const paid = payments && payments.total >= data.value;
              return (
                <span className={`payment-status payment-status--${paid ? 'paid' : 'pending'}`}>
                  {paid ? t('payments.status.paid') : t('payments.status.pending')}
                </span>
              )
            }}
          />

          <Column type="buttons" caption={t('payments.columns.actions')} width={100}>
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

        </DataGrid>}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(App))


