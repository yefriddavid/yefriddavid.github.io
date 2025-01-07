import React, { useState, useEffect, Component, PureComponent } from 'react'
import { DataGrid, Editing, Column, MasterDetail, Selection, LoadPanel, Button as GButton } from 'devextreme-react/data-grid'
import { Button } from 'devextreme-react/button'
import { fetchAccounts, fetchAccountPayments, addAccountPayment } from './Services'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { CFormInput, CFormSelect } from '@coreui/react'
import { CCol, CRow, CCardImage, CCardText, CCardTitle } from '@coreui/react'
import * as paymentActions from '../../../actions/paymentActions'
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import DatePicker from "react-datepicker";
import moment from "moment";
import { CSpinner } from '@coreui/react'

import "react-datepicker/dist/react-datepicker.css";




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




class ModalPaymentComponent extends PureComponent {

  //const [selectedImage, setSelectedImage] = useState(null);
  /*state = {

  }*/
  // const [formState, setState] = useState({ value: 0, fullPayed: true, paymentMethod: account?.paymentMethod || "Payment xx" })


  constructor(props) {
    super(props)
    const { account } = props

    this.state = {
      //prueba: this.props,
      fullPayed: true,
      // value: 0,
      paymentMethod: account?.paymentMethod,
      value: account?.value
    }

  }
  componentDidMount() {
    // this.fetchData()
  }

  setDate = date => {
    this.setFormState({ target: { name: "date", value: date } })
  }
  setFormState = (e, b) => {

    const { value, name } = e.target
    const { state: formState } = this
    const { account } = this.props

    if (name == "fullPayed") {

      let newAccountValue = null;

      if (!formState.fullPayed) {

        newAccountValue = account.value

      }
      else {
        newAccountValue = 0
      }

      this.setState({ ...formState, [name]: !formState.fullPayed, value: newAccountValue })

    }
    else {

      this.setState({ ...formState, [name]: value })

    }

  }
  onChangeImage = async (e) => {

    console.log(e.target.files);
    const file = e.target.files[0];
    let base64String;

    let reader = new FileReader();

    const self = this

    reader.onload = function () {
      base64String = reader.result
      /*base64String = reader.result.replace("data:", "")
          .replace(/^.+,/, "");*/

      //imageBase64Stringsep = base64String;

      // alert(imageBase64Stringsep);
      //console.log(base64String);
      self.setFormState({ target: { value: base64String, name: "vaucher"}})
      //self.setStatus({ ...self.state, vaucher: base64String });
      //self.render()


    }
    reader.readAsDataURL(file);

  }

  setValueDefault = async (e) => {

    this.setState({ ...formState, value: account.value })

  }
  savePayment = async () => {

    const { account } = this.props
    const { state } = this
    // console.log("start save");
    const formData = {
      accountId: account.accountId,
      //comment: formState.comment,
      deviceId: "web",
      //date: state.date,
      //value: state.value,
      month: account.month,
      year: account.year,
      ...state
      ,date: moment(state.date).format("yyyy/MMM/DD")
      //paymentMethod: state.paymentMethod,
      //vaucher: state.vaucher,
    }
    console.log(formData);

    // const newPayment = await addAccountPayment(formData)

    this.props.actions.payments.createRequest(formData)

    //const { paymentId } = newPayment.data
    // console.log(paymentId);

  }
  // const [visible1, setVisible] = useState(false)

  render() {

    const { setFormState, props, state, onChangeImage, savePayment } = this
    const { account, visible, setVisible, name } = props
    const { vaucher, fullPayed, comment, date, paymentMethod, value } = state

    const { fetching } = this.props.payments

    let saveButtonControl = null

    if(fetching === true){
      saveButtonControl = <CSpinner color="info" />
    }
    else {
      saveButtonControl = <CButton color="primary" onClick={() => savePayment(account)}>Save changes</CButton>

    }
  console.log(fetching);
    //console.log("showme account object");
    //console.log(account);
    //return (<></>)
    return account ? (
      <>
        <CModal visible={visible} onClose={() => setVisible(null)}>
          <CModalHeader>
            <CModalTitle>New Payment ({account?.accountId})</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Account: <b>{account?.name}</b>
            <br />
            Pago completo:
            <input type="checkbox" onChange={(e) => setFormState(e)} defaultChecked={fullPayed} name="fullPayed" id="fullPayed" />
            <br />
            Value:
            <CFormInput type="text" onChange={setFormState} value={value} name="value" id="value" />
            <br />
            Comment:
            <CFormInput type="text" onChange={setFormState} value={comment} name="comment" id="comment" />
            <br />
            Date:
            <DatePicker selected={date} onChange={(date) => this.setDate(date)} name="date" />

            <br />
            Payment Method:
            <CFormSelect onChange={setFormState} value={paymentMethod} name="paymentMethod">
              <option value="Cash">
                Cash
              </option>
              <option value="Credit Card">
                Credit Card
              </option>
            </CFormSelect>
            <br />
            Vaucher:
            <CFormInput type="file" onChange={onChangeImage} />
            <br />
            <center>
              <img width="200" hight="300" src={vaucher} />
            </center>

          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false, name)}>
              Close
            </CButton>
            { saveButtonControl }
          </CModalFooter>
        </CModal>
      </>
    ) : null
  }
}

const mapStateToProps = (state) => {
    return {
      payments: state.payment.state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: {
            payments: bindActionCreators(paymentActions, dispatch),
          // accounts: bindActionCreators(accountActions, dispatch)
        }
    }
}

ModalPaymentComponent.propTypes = {
  account: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalPaymentComponent)


