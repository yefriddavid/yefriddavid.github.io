import React, { useState, useEffect, Component } from 'react'
import { VaucherControlViewer } from './VaucherControlViewer'
import { DataGrid, Editing, Column, MasterDetail, Selection, LoadPanel, Button as GButton } from 'devextreme-react/data-grid'
import { Button } from 'devextreme-react/button'
import { fetchAccounts, fetchAccountPayments, addAccountPayment } from './Services'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
//import CFormInput from '@coreui/react/src/components/form/CFormInput'
import { CFormInput, CFormSelect } from '@coreui/react'
import { CCol, CRow, CCardImage, CCardText, CCardTitle } from '@coreui/react'
import moment from 'moment'
import { useTranslation } from "react-i18next";
import { VaucherModalViewer } from './Controls'

import './ItemDetail.scss'
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import * as paymentActions from '../../../actions/paymentActions'
import * as accountActions from '../../../actions/accountActions'
import { bindActionCreators } from 'redux';


const currencyCode = "COP";
const myCode = 'es-CO'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPopover,
  CTooltip,
} from '@coreui/react'



// <VaucherControlViewer key={i.paymentId} paymentId={i.paymentId} />

class ItemDetail1 extends Component {

  t = (e) => {

    return e
    return useTranslation()(e)
  }

  loaded = false
  // componentDidMount() {
  showVaucher(v) {

    this.props.actions.accounts.selectVaucher(v)
    //alert("prueba cacacrast");


  }
  onBtNext() {
   alert("fetch from here")
    const { account } = this.props
    //console.log("componentDidMount");
    //console.log(account);

    this.props.actions.accounts.loadVauchersToAccountPayment(account)
    //if (account && !account.vaucherLoaded){
    //  // if (account && this.loaded == false){
    //
    //  console.log(account.vaucherLoaded);
    //console.log("Llomo el api");
    //  this.props.actions.accounts.loadVauchersToAccountPayment(account)
    //  this.loaded = true
    //  //console.log("Llomo el api");

    //}
    //console.log(account);

  }

  formatValue = value => {

    const price = value;

    // Format the price above to USD using the locale, style, and currency.
    let CurrencyFormat = new Intl.NumberFormat(myCode, {
        style: 'currency',
        currency: currencyCode,
    });
    return CurrencyFormat.format(price)

  }

  fetchData = async () => {
    try {

      const accounts = await fetchAccountPayments({ year, month, accountId: itemAccount.accountId })

      const payments = accounts.data?.payments?.items || []

      setLoad(true)
      setData(payments)
    } catch (error) {
      console.error('Error loading jQuery:', error);
    }
  };

  //useEffect(() => {
  //  fetchData();
  //}, []);


  render(){
    //const load = false

    const { t, formatValue } = this;
    const { account } = this.props
    const { selectedVaucher } = this.props.accounts
    //const { data: itemAccount } = account
    const { payments } = account;

    const data = payments?.items || []
    const comment = data.length ? data[0].comment : "";
    const value = data.length ? data[0].value : "";

    //console.log("render");
    //console.log(account.vaucherLoaded);

    /*if (load !== true) {
    // if (true) {
      return <center>
        <h5>Loading...</h5>
      </center>

    }*/

    const myPayments = data || [];
    if (!myPayments.length) {
      return <div className="payment-detail__empty">No payments yet...</div>
    }

    return (
      <div className="payment-detail">
        {myPayments.map((i) => (
          <VaucherModalViewer key={i.paymentId} vaucher={selectedVaucher} paymentId={i.paymentId} visible={!!selectedVaucher} setVisible={() => this.showVaucher(null)} />
        ))}
        <CRow className="g-3">
          {myPayments.map((i) => (
            <CCol key={i.paymentId} xs={12} sm={6} md={4} lg={3}>
              <div className="payment-card">
                <div className="payment-card__image">
                  <VaucherControlViewer payment={i} />
                </div>
                <div className="payment-card__amount">
                  {formatValue(i.value)}
                </div>
                <div className="payment-card__details">
                  <div className="payment-card__row">
                    <span className="payment-card__label">Date</span>
                    <span className="payment-card__value">{moment(i.date).format("MMM DD, YYYY")}</span>
                  </div>
                  <div className="payment-card__row">
                    <span className="payment-card__label">Method</span>
                    <span className="payment-card__badge">{i.payment_method}</span>
                  </div>
                  {i.comment && (
                    <div className="payment-card__comment">{i.comment}</div>
                  )}
                  <div className="payment-card__id">#{i.paymentId}</div>
                </div>
                <div className="payment-card__actions">
                  <CButton color="light" size="sm">Edit</CButton>
                  <CButton color="light" size="sm" style={{ color: '#e03131' }}>Remove</CButton>
                  <CButton color="info" size="sm" variant="outline" onClick={() => this.showVaucher(i)}>Voucher</CButton>
                </div>
              </div>
            </CCol>
          ))}
        </CRow>
      </div>
    )

  }
};

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

const ItemDetail = (account, year, month ) => {

  return (<ItemDetailControl account={account}/>)
}

const ItemDetailControl = connect(mapStateToProps, mapDispatchToProps)(ItemDetail1)
//export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail)
export default ItemDetail
