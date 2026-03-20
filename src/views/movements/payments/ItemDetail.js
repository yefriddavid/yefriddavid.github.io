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
import { bindActionCreators } from 'redux'
import { CreatePaymentVaucher, UpdatePaymentVaucher } from '../../../services/providers/firebase/paymentVaucher'


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



// ─── Voucher Uploader ─────────────────────────────────────────────
const pdfToImage = async (file) => {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.js',
    import.meta.url,
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const page = await pdf.getPage(1)

  const scale = 2
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width  = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise

  return canvas.toDataURL('image/jpeg', 0.92)
}

const VoucherUploader = ({ payment, onClose, onUploaded }) => {
  const [preview, setPreview]       = React.useState(payment.vaucher || null)
  const [isDirty, setIsDirty]       = React.useState(false)
  const [dragOver, setDragOver]     = React.useState(false)
  const [uploading, setUploading]   = React.useState(false)
  const [converting, setConverting] = React.useState(false)
  const [error, setError]           = React.useState(null)
  const [success, setSuccess]       = React.useState(false)
  const inputRef = React.useRef()

  const readFile = async (file) => {
    if (!file) return
    setError(null)

    if (file.type === 'application/pdf') {
      setConverting(true)
      try {
        const base64 = await pdfToImage(file)
        setPreview(base64)
        setIsDirty(true)
      } catch {
        setError('No se pudo convertir el PDF. Intenta con otro archivo.')
      } finally {
        setConverting(false)
      }
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes o PDFs.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => { setPreview(e.target.result); setIsDirty(true) }
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    readFile(e.dataTransfer.files[0])
  }

  const onUpload = async () => {
    if (!preview || !isDirty) return
    setUploading(true); setError(null)
    try {
      if (payment.vaucher) {
        await UpdatePaymentVaucher({ paymentId: parseInt(payment.paymentId), vaucher: preview })
      } else {
        await CreatePaymentVaucher({ paymentId: parseInt(payment.paymentId), vaucher: preview })
      }
      setSuccess(true)
      setTimeout(() => { onUploaded(payment.paymentId, preview); }, 900)
    } catch (e) {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="voucher-uploader">
      <div className="voucher-uploader__header">
        <span className="voucher-uploader__title">Voucher</span>
        <span className="voucher-uploader__id">#{payment.paymentId}</span>
      </div>

      <div className="voucher-uploader__body">
        {/* Drop zone */}
        <div
          className={`voucher-uploader__zone${dragOver ? ' voucher-uploader__zone--active' : ''}`}
          onClick={() => inputRef.current.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
        >
          {uploading ? (
            <div className="voucher-uploader__placeholder">
              <span className="voucher-uploader__spinner voucher-uploader__spinner--dark" />
              <span className="voucher-uploader__hint">Guardando...</span>
            </div>
          ) : converting ? (
            <div className="voucher-uploader__placeholder">
              <span className="voucher-uploader__spinner voucher-uploader__spinner--dark" />
              <span className="voucher-uploader__hint">Convirtiendo PDF...</span>
            </div>
          ) : preview ? (
            <img className="voucher-uploader__preview" src={preview} alt="voucher" />
          ) : (
            <div className="voucher-uploader__placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="voucher-uploader__hint">Arrastra o haz click</span>
              <span className="voucher-uploader__sub">PNG · JPG · WEBP · PDF</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => readFile(e.target.files[0])}
          />
        </div>

        {preview && (
          <button className="voucher-uploader__change" onClick={() => inputRef.current.click()}>
            Cambiar imagen
          </button>
        )}

        {error && <p className="voucher-uploader__error">{error}</p>}

        {success && (
          <div className="voucher-uploader__success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Guardado
          </div>
        )}
      </div>

      <div className="voucher-uploader__actions">
        <CButton className="voucher-uploader__btn voucher-uploader__btn--cancel" onClick={onClose} disabled={uploading}>
          Cancelar
        </CButton>
        <CButton
          className={`voucher-uploader__btn voucher-uploader__btn--save${!isDirty ? ' voucher-uploader__btn--disabled' : ''}`}
          onClick={onUpload}
          disabled={!isDirty || uploading}
        >
          {uploading ? <span className="voucher-uploader__spinner" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}

// ─── Payment Edit Form ────────────────────────────────────────────
const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Tarjeta débito', 'Tarjeta crédito', 'Cheque', 'Otro']

const PaymentEditForm = ({ payment, onCancel, onSave }) => {
  const [form, setForm] = React.useState({
    value: payment.value || '',
    date: payment.date ? moment(payment.date).format('YYYY-MM-DD') : '',
    payment_method: payment.payment_method || '',
    comment: payment.comment || '',
  })

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = () => onSave({ ...payment, ...form, value: Number(form.value) })

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">Editar pago</span>
        <span className="payment-form__id">#{payment.paymentId}</span>
      </div>

      <div className="payment-form__body">
        <div className="payment-form__field">
          <label className="payment-form__label">Valor</label>
          <input
            className="payment-form__input"
            type="number"
            value={form.value}
            onChange={set('value')}
            placeholder="0"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Fecha</label>
          <input
            className="payment-form__input"
            type="date"
            value={form.date}
            onChange={set('date')}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Método de pago</label>
          <select className="payment-form__input payment-form__input--select" value={form.payment_method} onChange={set('payment_method')}>
            <option value="">Seleccionar...</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Comentario</label>
          <textarea
            className="payment-form__input payment-form__input--textarea"
            value={form.comment}
            onChange={set('comment')}
            placeholder="Observaciones..."
            rows={3}
          />
        </div>
      </div>

      <div className="payment-form__actions">
        <CButton className="payment-form__btn payment-form__btn--cancel" onClick={onCancel}>
          Cancelar
        </CButton>
        <CButton className="payment-form__btn payment-form__btn--save" onClick={handleSave}>
          Guardar
        </CButton>
      </div>
    </div>
  )
}

// <VaucherControlViewer key={i.paymentId} paymentId={i.paymentId} />

class ItemDetail1 extends Component {

  t = (e) => {

    return e
    return useTranslation()(e)
  }

  state = { editingPayment: null, voucherPayment: null, previewVoucher: null }

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

  startEdit      = (payment) => this.setState({ editingPayment: payment, voucherPayment: null })
  cancelEdit     = () => this.setState({ editingPayment: null })
  openVoucher    = (payment) => this.setState({ voucherPayment: payment, editingPayment: null })
  closeVoucher   = () => this.setState({ voucherPayment: null })
  openPreview    = (payment) => this.setState({ previewVoucher: payment })
  closePreview   = () => this.setState({ previewVoucher: null })
  onVoucherUploaded = (paymentId, voucherBase64) => {
    const { account } = this.props
    const updatedItems = account.payments.items.map((p) =>
      p.paymentId === paymentId ? { ...p, vaucher: voucherBase64 } : p
    )
    const updatedAccount = { ...account, payments: { ...account.payments, items: updatedItems } }
    this.props.actions.accounts.appendVauchersToAccount(updatedAccount)
    this.closeVoucher()
  }
  saveEdit = (updated) => {
    // TODO: dispatch update action
    console.log('save', updated)
    this.setState({ editingPayment: null })
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

    const { t, formatValue, startEdit, cancelEdit, saveEdit, openVoucher, closeVoucher, onVoucherUploaded, openPreview, closePreview } = this;
    const { editingPayment, voucherPayment, previewVoucher } = this.state;
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
        <CModal size="xl" visible={!!previewVoucher} onClose={closePreview} alignment="center">
          <CModalHeader>
            <CModalTitle>Voucher #{previewVoucher?.paymentId}</CModalTitle>
          </CModalHeader>
          <CModalBody style={{ textAlign: 'center', background: '#f8f9fa' }}>
            <img
              src={previewVoucher?.vaucher}
              alt="voucher"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
            />
          </CModalBody>
        </CModal>
        {myPayments.map((i) => (
          <VaucherModalViewer key={i.paymentId} vaucher={selectedVaucher} paymentId={i.paymentId} visible={!!selectedVaucher} setVisible={() => this.showVaucher(null)} />
        ))}
        <CRow className="g-3">
          {myPayments.map((i) => (
            <CCol key={i.paymentId} xs={12} sm={6} md={4} lg={3}>
              {voucherPayment?.paymentId === i.paymentId ? (
                <VoucherUploader
                  payment={i}
                  onClose={closeVoucher}
                  onUploaded={(paymentId, base64) => onVoucherUploaded(paymentId, base64)}
                />
              ) : editingPayment?.paymentId === i.paymentId ? (
                <PaymentEditForm
                  payment={i}
                  onCancel={cancelEdit}
                  onSave={saveEdit}
                />
              ) : (
                <div className="payment-card">
                  <div
                    className="payment-card__image"
                    onClick={() => i.vaucher && openPreview(i)}
                    style={i.vaucher ? { cursor: 'zoom-in' } : undefined}
                  >
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
                    <CButton color="light" size="sm" onClick={() => startEdit(i)}>Edit</CButton>
                    <CButton color="light" size="sm" style={{ color: '#e03131' }}>Remove</CButton>
                    <CButton color="info" size="sm" variant="outline" onClick={() => openVoucher(i)}>Voucher</CButton>
                  </div>
                </div>
              )}
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
