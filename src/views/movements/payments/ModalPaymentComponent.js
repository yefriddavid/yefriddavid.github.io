import React, { useState, useEffect, Component } from 'react'
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




class ModalPaymentComponent extends Component {

  state = {

  }
  // const [formState, setState] = useState({ value: 0, fullPayed: true, paymentMethod: account?.paymentMethod || "Payment xx" })

  setDefaultState = () => {
    const { account } = this.props
    this.setState({
      fullPayed: true,
      value: 0,
      paymentMethod: account?.paymentMethod
    });
  }
  componentDidMount() {
    // this.fetchData()
  }

  setFormState = (e, b) => {

    return
    const { value, name } = e.target
    const { state: formState } = this


    if (name == "fullPayed") {

      if (formState.fullPayed == true) {
        this.setState({ ...formState, value: account.value })

      }
      else {
        //setFormState({ target: { name: "value", value: 0 } })
        this.setState({ ...formState, value: 0 })

      }
      this.setState({ ...formState, [name]: !formState.fullPayed })
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
    console.log("next");

    reader.onload = function () {
      base64String = reader.result
      /*base64String = reader.result.replace("data:", "")
          .replace(/^.+,/, "");*/

      //imageBase64Stringsep = base64String;

      // alert(imageBase64Stringsep);
      console.log(base64String);
      this.setState({ ...formState, vaucher: base64String });

    }
    reader.readAsDataURL(file);

  }

  setValueDefault = async (e) => {

    // console.log(e.target.value);
    this.setState({ ...formState, value: account.value })

  }
  savePayment = async (account) => {

    // console.log("start save");
    const formData = {
      accountId: account.accountId,
      //comment: formState.comment,
      deviceId: "web",
      //date: formState.date,
      //value: formState.value,
      month: account.month,
      year: account.year,
      //paymentMethod: formState.paymentMethod,
      //vaucher: formState.vaucher,


    }
    // const newPayment = await addAccountPayment(formData)
    this.props.actions.payments.createRequest(formData)
    //const { paymentId } = newPayment.data
    // console.log(paymentId);

  }
  // const [visible1, setVisible] = useState(false)

  render() {

    const { setFormState, props, state: formState, onChangeImage, savePayment } = this
    const { account, visible, setVisible, name } = props

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
            <input type="checkbox" onChange={setFormState} defaultChecked={formState.fullPayed} name="fullPayed" id="fullPayed" />
            <br />
            Value:
            <CFormInput type="text" onChange={setFormState} value={formState.value} name="value" id="value" />
            <br />
            Comment:
            <CFormInput type="text" onChange={setFormState} value={formState.comment} name="comment" id="comment" />
            <br />
            Date:
            <CFormInput type="text" onChange={setFormState} value={formState.date} name="date" id="date" />
            <br />
            Payment Method:
            <CFormSelect onChange={setFormState} value={formState.paymentMethod} name="paymentMethod">
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
              <img width="200" hight="300" src={formState.vaucher} />
              {JSON.stringify(formState)}
              {JSON.stringify(account)}
            </center>

          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false, name)}>
              Close
            </CButton>
            <CButton color="primary" onClick={() => savePayment(account)}>Save changes</CButton>
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

export default connect(mapStateToProps, mapDispatchToProps)(ModalPaymentComponent)


