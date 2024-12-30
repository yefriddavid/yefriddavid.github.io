import React, { useState, useEffect, Component } from 'react'
import { VaucherControlViewer } from './Database'
import { DataGrid, Editing, Column, MasterDetail, Selection, LoadPanel, Button as GButton } from 'devextreme-react/data-grid'
import { Button } from 'devextreme-react/button'
import { fetchAccounts, fetchAccountPayments, addAccountPayment } from './Services'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
//import CFormInput from '@coreui/react/src/components/form/CFormInput'
import { CFormInput } from '@coreui/react'


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
        onChange={ this.onChangeValueHandler }
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

  const [formState, setState] = useState({ value: 0, fullPayed: true })
  console.log("visible");
  console.log(visible);

  // const [visible1, setVisible] = useState(false)
  return vaucher? (
    <>
      <CModal size="xl" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Vaucher ({paymentId || null})</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <center>
          <img width1="200" hight1="200" src={vaucher} />
        </center>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={ () => savePayment() }>Delete</CButton>
          <CButton color="primary" onClick={ () => savePayment() }>Change</CButton>
          <CButton color="secondary" onClick={() => setVisible(false, name)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  ) : null
}
const NewPaymentComponent = ({visible, setVisible, account, name}) => {

  const [formState, setState] = useState({ value: 0, fullPayed: true })

  const setFormState = (e, b) => {

    const { value, name } = e.target


    if(name=="fullPayed"){

      if (formState.fullPayed == true){
        setState({ ...formState, value: account.value } )

      }
      else {
        //setFormState({ target: { name: "value", value: 0 } })
        setState({ ...formState, value: 0 } )

      }
      setState({...formState, [name]: !formState.fullPayed})
    }
    else{

      setState({...formState, [name]: value})
    }

  }
  const onChangeImage = async (e) => {

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
              setState({ ...formState, vaucher: base64String });

            }
    reader.readAsDataURL(file);

  }
  const setValueDefault = async (e) => {

    console.log(e.target.value);
    setState({...formState, value: account.value})

  }
  const savePayment = async () => {

    console.log("start save");
    const formData = {
      accountId: account.accountId,
      comment: formState.comment,
      deviceId: "web",
      date: formState.date,
      value: formState.value,
      month: account.month,
      year: account.year,
      vaucher: formState.vaucher,


    }
    const newPayment = await addAccountPayment(formData)
    const {paymentId} = newPayment.data
    console.log(paymentId);

  }
  // const [visible1, setVisible] = useState(false)
  return account? (
    <>
      <CButton color="primary" onClick={() => setVisible(!visible)}>
        Launch demo modal
      </CButton>
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>New Payment ({account?.accountId})</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Account: <b>{account?.name}</b>
          <br />
          Pago completo:
          <input type="checkbox" onChange={ setFormState } defaultChecked={formState.fullPayed} name="fullPayed" id="fullPayed" />
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
          Vaucher:
          <CFormInput type="file" onChange={onChangeImage} />
          <br />
          <center>
          <img width="200" hight="300" src={formState.vaucher} />
        </center>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false, name)}>
            Close
          </CButton>
          <CButton color="primary" onClick={ () => savePayment() }>Save changes</CButton>
        </CModalFooter>
      </CModal>
    </>
  ) : null
}

const ItemDetail = (account, year, month, onOpenVaucher) => {
  const [data, setData] = useState([])
  const [load, setLoad] = useState([])
  //const [currentVaucher, setCurrentVaucher] = useState()

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
      <VaucherControlViewer key={i.paymentId} paymentId={i.paymentId} />
      
      <hr />
    </div>
  )
  return (
    <ul>
      comment: {comment} <br />
      value: {value} <br />
      <br />
      <button onClick={ (e) => onOpenVaucher(true, "showVaucherPaymentModal") }>
        show Vaucher
      </button>
    </ul>
  );

  return (
    <div>
      david rios
    </div>
  );
};

export {
  SelectControl,
  NewPaymentComponent,
  ItemDetail,
VaucherModalViewer
}
