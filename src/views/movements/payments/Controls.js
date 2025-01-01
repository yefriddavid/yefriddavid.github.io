import React, { useState, useEffect, Component } from 'react'
// import { VaucherControlViewer } from './Database'
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




class SelectControl extends Component {
  state = {
    value: ''
  }
  onChangeValueHandler = (_, v) => {
    const { onChange, name } = this.props;
    onChange(v, name)
  }

  render() {
    const { value, onChange, title, options } = this.props;

    return (<>
      <h3>{title}</h3>
      <Autocomplete
        onChange={this.onChangeValueHandler}
        value={value}
        options={options}
        style={{ width: 300, hight: 50 }}
        renderInput={(params) =>
          <TextField {...params} label={title} variant="outlined" />}
      />
    </>)

  }
}
const VaucherModalViewer = ({ paymentId, vaucher, visible, setVisible, name }) => {

  //const [formState, setState] = useState({ value: 0, fullPayed: true })
  //console.log("visible");
  //console.log(visible);

  // const [visible1, setVisible] = useState(false)
  return vaucher ? (
    <>
      <CModal size="xl" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Vaucher ({paymentId || null})</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <center>
            <img width1="200" hight1="200" src={vaucher.vaucher} />
          </center>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => savePayment()}>Delete</CButton>
          <CButton color="primary" onClick={() => savePayment()}>Change</CButton>
          <CButton color="secondary" onClick={() => setVisible(false, name)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  ) : null
}
//const NewPaymentComponent = ({visible, setVisible, account, name}) => {
class NewPaymentComponent extends Component {

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
  savePayment = async () => {

    // console.log("start save");
    const formData = {
      accountId: account.accountId,
      comment: formState.comment,
      deviceId: "web",
      date: formState.date,
      value: formState.value,
      month: account.month,
      year: account.year,
      paymentMethod: formState.paymentMethod,
      vaucher: formState.vaucher,


    }
    // const newPayment = await addAccountPayment(formData)
    const { paymentId } = newPayment.data
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
            <CButton color="primary" onClick={() => savePayment()}>Save changes</CButton>
          </CModalFooter>
        </CModal>
      </>
    ) : null
  }
}

//const ItemDetail = (account, year, month, onOpenVaucher) => {
//
//  const { t } = useTranslation();
//
//  const { data: itemAccount } = account
//  const { payments } = itemAccount;
//  //console.log(payments);
//  const [data, setData] = useState(payments?.items || [])
//  const [load, setLoad] = useState(true)
//  //const [currentVaucher, setCurrentVaucher] = useState()
//
//  //setData(payments)
//
//  // const { year, monthNumber,  } = this.state
//
//  const formatValue = value => {
//
//    const price = value;
//
//    // Format the price above to USD using the locale, style, and currency.
//    let CurrencyFormat = new Intl.NumberFormat(myCode, {
//        style: 'currency',
//        currency: currencyCode,
//    });
//    return CurrencyFormat.format(price)
//
//  }
//  const fetchData = async () => {
//    try {
//
//      const accounts = await fetchAccountPayments({ year, month, accountId: itemAccount.accountId })
//
//      const payments = accounts.data?.payments?.items || []
//
//      setLoad(true)
//      setData(payments)
//    } catch (error) {
//      console.error('Error loading jQuery:', error);
//    }
//  };
//
//  //useEffect(() => {
//  //  fetchData();
//  //}, []);
//
//
//  const comment = data.length ? data[0].comment : "";
//  const value = data.length ? data[0].value : "";
//
//
//  if (load !== true) {
//    return <center>
//      <h5>Loading...</h5>
//    </center>
//
//  }
//
//  const myPayments = data || [];
//  if (!myPayments.length) {
//    return <center>
//      <h5>No payments yet...</h5>
//    </center>
//
//  }
//
//  return (
//    <CRow>
//      {myPayments.map((i) => (
//        <CCol sm={3} key={crypto.randomUUID()}>
//          <CCard key={i.paymentId} style={{ width: '18rem' }}>
//            <VaucherControlViewer key={i.paymentId} paymentId={i.paymentId} />
//            <CCardBody>
//              <CCardTitle>{formatValue(i.value)}</CCardTitle>
//              <CCardText>
//                <ul style={{paddingLeft: "10px"}}>
//                  <li style={{textWrap: 'wrap'}}><b>{t("comment")}</b>: {i.comment} </li>
//                  <li><b>{t("paymentMethod")}</b>: {i.payment_method} </li>
//                  <li><b>{t("date")}</b>: {moment(i.date).format("yyyy/MMM/DD")} </li>
//                </ul>
//              </CCardText>
//              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
//                <CButton color="primary" size="sm">
//                  {t("edit")}
//                </CButton>
//                <CButton color="danger" size="sm">
//                  {t("remove")}
//                </CButton>
//                <CButton color="info" size="sm">
//                  {t("showVaucher")}
//                </CButton>
//              </div>
//            </CCardBody>
//          </CCard>
//        </CCol>
//      ))}
//    </CRow>)
//
//  //return myPayments.map((i) =>
//  //  <div key={i.paymentId}>
//  //    ID: {i.paymentId} <br />
//  //    comment: {i.comment} <br />
//  //    value: {i.value} <br />
//  //    <br />
//  //    <VaucherControlViewer key={i.paymentId} paymentId={i.paymentId} />
//  //
//  //    <hr />
//  //  </div>
//  //)
//  //return (
//  //  <ul>
//  //    comment: {comment} <br />
//  //    value: {value} <br />
//  //    <br />
//  //    <button onClick={ (e) => onOpenVaucher(true, "showVaucherPaymentModal") }>
//  //      show Vaucher
//  //    </button>
//  //  </ul>
//  //);
//
//  //return (
//  //  <div>
//  //    david rios
//  //  </div>
//  //);
//};

export {
  SelectControl,
  NewPaymentComponent,
  //ItemDetail,
  VaucherModalViewer
}
