import React, { useState, useEffect, Component } from 'react'
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
const NewPaymentComponent = ({visible, setVisible, account}) => {

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
  return (
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
          <img src={formState.vaucher} />

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false, "showModal")}>
            Close
          </CButton>
          <CButton color="primary" onClick={ () => savePayment() }>Save changes</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export {
  SelectControl,
  NewPaymentComponent
}
