import React, { Component } from 'react'
import { VaucherControlViewer } from './VaucherControlViewer'
import { fetchAccountPayments } from './Services'
//import CFormInput from '@coreui/react/src/components/form/CFormInput'
import {
  CButton,
  CCol,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import { connect } from 'react-redux'
import * as paymentActions from '../../../actions/cashflow/paymentActions'
import * as accountActions from '../../../actions/cashflow/accountActions'
import { bindActionCreators } from 'redux'
import moment, { formatDate, formatDisplayDate, formatInputDate } from 'src/utils/moment'
import { useTranslation, withTranslation } from 'react-i18next'
import { VaucherModalViewer } from './Controls'
import {
  CreatePaymentVaucher,
  UpdatePaymentVaucher,
  fetchVaucherPayment,
} from '../../../services/firebase/cashflow/paymentVaucher'
import { setCache, clearCache } from '../../../services/voucherCache'

import './ItemDetail.scss'

const currencyCode = 'COP'
const myCode = 'es-CO'

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
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise

  return canvas.toDataURL('image/jpeg', 0.92)
}

const VoucherUploader = ({ payment, onClose, onUploaded }) => {
  const { t } = useTranslation()
  const [preview, setPreview] = React.useState(payment.vaucher || null)
  const [isDirty, setIsDirty] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [converting, setConverting] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [success, setSuccess] = React.useState(false)
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
        setError(t('voucher.error.pdf'))
      } finally {
        setConverting(false)
      }
      return
    }

    if (!file.type.startsWith('image/')) {
      setError(t('voucher.error.format'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      setIsDirty(true)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    readFile(e.dataTransfer.files[0])
  }

  const onUpload = async () => {
    if (!preview || !isDirty) return
    setUploading(true)
    setError(null)
    try {
      if (payment.vaucher) {
        await UpdatePaymentVaucher({ paymentId: parseInt(payment.paymentId), vaucher: preview })
      } else {
        await CreatePaymentVaucher({ paymentId: parseInt(payment.paymentId), vaucher: preview })
      }
      setSuccess(true)
      setTimeout(() => {
        onUploaded(payment.paymentId, preview)
      }, 900)
    } catch (e) {
      setError(t('voucher.error.save'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="voucher-uploader">
      <div className="voucher-uploader__header">
        <span className="voucher-uploader__title">{t('voucher.title')}</span>
        <span className="voucher-uploader__id">#{payment.paymentId}</span>
      </div>

      <div className="voucher-uploader__body">
        <div
          className={`voucher-uploader__zone${dragOver ? ' voucher-uploader__zone--active' : ''}`}
          onClick={() => inputRef.current.click()}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
        >
          {uploading ? (
            <div className="voucher-uploader__placeholder">
              <span className="voucher-uploader__spinner voucher-uploader__spinner--dark" />
              <span className="voucher-uploader__hint">{t('voucher.saving')}</span>
            </div>
          ) : converting ? (
            <div className="voucher-uploader__placeholder">
              <span className="voucher-uploader__spinner voucher-uploader__spinner--dark" />
              <span className="voucher-uploader__hint">{t('voucher.converting')}</span>
            </div>
          ) : preview ? (
            <img className="voucher-uploader__preview" src={preview} alt="voucher" />
          ) : (
            <div className="voucher-uploader__placeholder">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="voucher-uploader__hint">{t('voucher.dragOrClick')}</span>
              <span className="voucher-uploader__sub">{t('voucher.formats')}</span>
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
            {t('voucher.changeImage')}
          </button>
        )}

        {error && <p className="voucher-uploader__error">{error}</p>}

        {success && (
          <div className="voucher-uploader__success">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t('voucher.saved')}
          </div>
        )}
      </div>

      <div className="voucher-uploader__actions">
        <CButton
          className="voucher-uploader__btn voucher-uploader__btn--cancel"
          onClick={onClose}
          disabled={uploading}
        >
          {t('common.cancel')}
        </CButton>
        <CButton
          className={`voucher-uploader__btn voucher-uploader__btn--save${!isDirty ? ' voucher-uploader__btn--disabled' : ''}`}
          onClick={onUpload}
          disabled={!isDirty || uploading}
        >
          {uploading ? <span className="voucher-uploader__spinner" /> : t('common.save')}
        </CButton>
      </div>
    </div>
  )
}

// ─── New Payment Card ─────────────────────────────────────────────
const NewPaymentCard = ({ account, onSave, onCancel, createPayment }) => {
  const { t } = useTranslation()
  const [form, setForm] = React.useState({
    value: account.value || '',
    date: formatInputDate(moment()),
    payment_method: account.paymentMethod || '',
    comment: '',
  })
  const [vaucher, setVaucher] = React.useState(null)
  const [converting, setConverting] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const inputRef = React.useRef()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const readFile = async (file) => {
    if (!file) return
    if (file.type === 'application/pdf') {
      setConverting(true)
      try {
        const blob = await pdfToBlob(file)
        const reader = new FileReader()
        reader.onload = (e) => setVaucher(e.target.result)
        reader.readAsDataURL(blob)
      } catch {
      } finally {
        setConverting(false)
      }
      return
    }
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setVaucher(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    setSaving(true)
    createPayment({
      accountId: account.accountId,
      deviceId: 'web',
      month: account.monthId,
      year: account.year,
      value: Number(form.value),
      date: formatDate(form.date),
      payment_method: form.payment_method,
      comment: form.comment,
      vaucher,
    })
    onSave()
  }

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">{t('paymentForm.newTitle', 'Nuevo pago')}</span>
        <span className="payment-form__id">{account.name}</span>
      </div>
      <div className="payment-form__body">
        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.value')}</label>
          <input
            className="payment-form__input"
            type="number"
            value={form.value}
            onChange={set('value')}
            placeholder="0"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.date')}</label>
          <input
            className="payment-form__input"
            type="date"
            value={form.date}
            onChange={set('date')}
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.method')}</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.payment_method}
            onChange={set('payment_method')}
          >
            <option value="">{t('paymentForm.selectMethod')}</option>
            {PAYMENT_METHOD_KEYS.map((m) => (
              <option key={m.key} value={t(m.tKey)}>
                {t(m.tKey)}
              </option>
            ))}
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.comment')}</label>
          <textarea
            className="payment-form__input payment-form__input--textarea"
            value={form.comment}
            onChange={set('comment')}
            placeholder={t('paymentForm.commentPlaceholder')}
            rows={2}
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">{t('voucher.title')}</label>
          <div
            className="voucher-uploader__zone"
            style={{ minHeight: 80 }}
            onClick={() => inputRef.current.click()}
          >
            {converting ? (
              <div className="voucher-uploader__placeholder">
                <span className="voucher-uploader__spinner voucher-uploader__spinner--dark" />
              </div>
            ) : vaucher ? (
              <img
                className="voucher-uploader__preview"
                src={vaucher}
                alt="voucher"
                style={{ maxHeight: 120 }}
              />
            ) : (
              <div className="voucher-uploader__placeholder">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="voucher-uploader__hint" style={{ fontSize: 11 }}>
                  {t('voucher.dragOrClick')}
                </span>
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
          {vaucher && (
            <button className="voucher-uploader__change" onClick={() => inputRef.current.click()}>
              {t('voucher.changeImage')}
            </button>
          )}
        </div>
      </div>
      <div className="payment-form__actions">
        <CButton
          className="payment-form__btn payment-form__btn--cancel"
          onClick={onCancel}
          disabled={saving}
        >
          {t('common.cancel')}
        </CButton>
        <CButton
          className="payment-form__btn payment-form__btn--save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CSpinner size="sm" /> : t('common.save')}
        </CButton>
      </div>
    </div>
  )
}

// ─── Payment Edit Form ────────────────────────────────────────────
const PAYMENT_METHOD_KEYS = [
  { key: 'cash', tKey: 'paymentForm.methods.cash' },
  { key: 'transfer', tKey: 'paymentForm.methods.transfer' },
  { key: 'debit', tKey: 'paymentForm.methods.debit' },
  { key: 'credit', tKey: 'paymentForm.methods.credit' },
  { key: 'check', tKey: 'paymentForm.methods.check' },
  { key: 'other', tKey: 'paymentForm.methods.other' },
]

export const PaymentEditForm = ({ payment, status, onCancel, onSave }) => {
  const { t } = useTranslation()
  const [form, setForm] = React.useState({
    value: payment.value || '',
    date: payment.date ? formatInputDate(payment.date) : '',
    payment_method: payment.payment_method || '',
    comment: payment.comment || '',
  })

  const statusLabel = status || ''

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = () => onSave({ ...payment, ...form, value: Number(form.value) })

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">
          {t('paymentForm.title')} <span className="payment-form__id">#{payment.paymentId}</span>
        </span>
      </div>

      <div className="payment-form__body">
        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.status')}</label>
          <input
            className="payment-form__input payment-form__input--readonly"
            type="text"
            value={statusLabel}
            readOnly
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.value')}</label>
          <input
            className="payment-form__input"
            type="number"
            value={form.value}
            onChange={set('value')}
            placeholder="0"
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.date')}</label>
          <input
            className="payment-form__input"
            type="date"
            value={form.date}
            onChange={set('date')}
          />
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.method')}</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.payment_method}
            onChange={set('payment_method')}
          >
            <option value="">{t('paymentForm.selectMethod')}</option>
            {PAYMENT_METHOD_KEYS.map((m) => (
              <option key={m.key} value={t(m.tKey)}>
                {t(m.tKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">{t('paymentForm.comment')}</label>
          <textarea
            className="payment-form__input payment-form__input--textarea"
            value={form.comment}
            onChange={set('comment')}
            placeholder={t('paymentForm.commentPlaceholder')}
            rows={3}
          />
        </div>
      </div>

      <div className="payment-form__actions">
        <CButton className="payment-form__btn payment-form__btn--cancel" onClick={onCancel}>
          {t('common.cancel')}
        </CButton>
        <CButton className="payment-form__btn payment-form__btn--save" onClick={handleSave}>
          {t('common.save')}
        </CButton>
      </div>
    </div>
  )
}

// <VaucherControlViewer key={i.paymentId} paymentId={i.paymentId} />

class ItemDetail1 extends Component {
  state = { editingPayment: null, voucherPayment: null, previewVoucher: null }

  loaded = false
  // componentDidMount() {
  showVaucher(v) {
    this.props.actions.accounts.selectVaucher(v)
    //alert("prueba cacacrast");
  }
  onBtNext() {
    alert('fetch from here')
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

  startEdit = (payment) => this.setState({ editingPayment: payment, voucherPayment: null })
  cancelEdit = () => this.setState({ editingPayment: null })
  openVoucher = (payment) => this.setState({ voucherPayment: payment, editingPayment: null })
  closeVoucher = () => this.setState({ voucherPayment: null })
  openPreview = (payment) => this.setState({ previewVoucher: payment })
  closePreview = () => this.setState({ previewVoucher: null })
  onVoucherUploaded = (paymentId, voucherData) => {
    setCache(paymentId, voucherData)
    const { account } = this.props
    const updatedItems = account.payments.items.map((p) =>
      p.paymentId === paymentId ? { ...p, vaucher: voucherData } : p,
    )
    const updatedAccount = { ...account, payments: { ...account.payments, items: updatedItems } }
    this.props.actions.accounts.appendVauchersToAccount(updatedAccount)
    this.closeVoucher()
  }

  refreshVoucher = async (payment) => {
    clearCache(payment.paymentId)
    const { account } = this.props
    // poner en estado loading
    const loadingItems = account.payments.items.map((p) =>
      p.paymentId === payment.paymentId ? { ...p, vaucher: false } : p,
    )
    this.props.actions.accounts.appendVauchersToAccount({
      ...account,
      payments: { ...account.payments, items: loadingItems },
    })
    // traer de Firestore y cachear
    const result = await fetchVaucherPayment(payment.paymentId)
    const freshVaucher = result.vaucher || ''
    setCache(payment.paymentId, freshVaucher)
    const freshItems = account.payments.items.map((p) =>
      p.paymentId === payment.paymentId ? { ...p, vaucher: freshVaucher } : p,
    )
    this.props.actions.accounts.appendVauchersToAccount({
      ...account,
      payments: { ...account.payments, items: freshItems },
    })
  }
  saveEdit = (updated) => {
    // TODO: dispatch update action
    this.setState({ editingPayment: null })
  }

  formatValue = (value) => {
    const price = value

    // Format the price above to USD using the locale, style, and currency.
    const CurrencyFormat = new Intl.NumberFormat(myCode, {
      style: 'currency',
      currency: currencyCode,
    })
    return CurrencyFormat.format(price)
  }

  fetchData = async () => {
    try {
      const accounts = await fetchAccountPayments({ year, month, accountId: itemAccount.accountId })

      const payments = accounts.data?.payments?.items || []

      setLoad(true)
      setData(payments)
    } catch (error) {
      console.error('Error loading jQuery:', error)
    }
  }

  //useEffect(() => {
  //  fetchData();
  //}, []);

  render() {
    //const load = false

    const { t } = this.props
    const {
      formatValue,
      startEdit,
      cancelEdit,
      saveEdit,
      openVoucher,
      closeVoucher,
      onVoucherUploaded,
      openPreview,
      closePreview,
      refreshVoucher,
    } = this
    const { editingPayment, voucherPayment, previewVoucher } = this.state
    const { account, showAddForm, onAddDone } = this.props
    const { selectedVaucher } = this.props.accounts
    //const { data: itemAccount } = account
    const { payments } = account
    const isPaid = payments && payments.total >= account.value
    const accountStatus = isPaid ? t('payments.status.paid') : t('payments.status.pending')

    const data = payments?.items || []

    //console.log("render");
    //console.log(account.vaucherLoaded);

    /*if (load !== true) {
    // if (true) {
      return <center>
        <h5>Loading...</h5>
      </center>

    }*/

    const myPayments = data || []
    if (!myPayments.length && !showAddForm) {
      return <div className="payment-detail__empty">{this.props.t('payments.empty')}</div>
    }

    return (
      <div className="payment-detail">
        <CModal size="xl" visible={!!previewVoucher} onClose={closePreview} alignment="center">
          <CModalHeader>
            <CModalTitle>{t('voucher.modalTitle', { id: previewVoucher?.paymentId })}</CModalTitle>
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
          <VaucherModalViewer
            key={i.paymentId}
            vaucher={selectedVaucher}
            paymentId={i.paymentId}
            visible={!!selectedVaucher}
            setVisible={() => this.showVaucher(null)}
          />
        ))}
        <CRow className="g-3">
          {showAddForm && (
            <CCol xs={12} sm={6} md={4} lg={3}>
              <NewPaymentCard
                account={account}
                onSave={onAddDone}
                onCancel={onAddDone}
                createPayment={this.props.actions.payments.createRequest}
              />
            </CCol>
          )}
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
                  status={accountStatus}
                  onCancel={cancelEdit}
                  onSave={saveEdit}
                />
              ) : (
                <div className="payment-card">
                  <div className="payment-card__header">
                    <span className="payment-card__title">
                      {t('payments.card.payment')} #{i.paymentId}
                    </span>
                  </div>
                  <div
                    className="payment-card__image"
                    onClick={() => i.vaucher && openPreview(i)}
                    style={i.vaucher ? { cursor: 'zoom-in' } : undefined}
                  >
                    <VaucherControlViewer payment={i} />
                  </div>
                  <div className="payment-card__amount">{formatValue(i.value)}</div>
                  <div className="payment-card__details">
                    <div className="payment-card__row">
                      <span className="payment-card__label">{t('payments.card.date')}</span>
                      <span className="payment-card__value">{formatDisplayDate(i.date)}</span>
                    </div>
                    <div className="payment-card__row">
                      <span className="payment-card__label">{t('payments.card.method')}</span>
                      <span className="payment-card__badge">{i.payment_method}</span>
                    </div>
                    {i.comment && <div className="payment-card__comment">{i.comment}</div>}
                  </div>
                  <div className="payment-card__actions">
                    <CButton color="light" size="sm" onClick={() => startEdit(i)}>
                      {t('common.edit')}
                    </CButton>
                    <CButton
                      color="light"
                      size="sm"
                      style={{ color: '#e03131' }}
                      onClick={() => {
                        if (window.confirm(t('payments.card.confirmDelete', { id: i.paymentId }))) {
                          this.props.actions.payments.deleteRequest({ paymentId: i.paymentId })
                        }
                      }}
                    >
                      {t('common.remove')}
                    </CButton>
                    <CButton
                      color="warning"
                      size="sm"
                      variant="outline"
                      onClick={() => openVoucher(i)}
                    >
                      {t('payments.card.voucher')}
                    </CButton>
                    <CButton
                      color="light"
                      size="sm"
                      title="Refresh"
                      disabled={i.vaucher === false}
                      onClick={() => refreshVoucher(i)}
                      style={{ padding: '2px 7px' }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    </CButton>
                  </div>
                </div>
              )}
            </CCol>
          ))}
        </CRow>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  //console.log(state)
  return {
    //isFetchingJunior: state.login.rest.fetching,
    accounts: state.account,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      //auth: bindActionCreators(authActions, dispatch),
      payments: bindActionCreators(paymentActions, dispatch),
      accounts: bindActionCreators(accountActions, dispatch),
    },
  }
}

const ItemDetail = (account, year, month, extraProps = {}) => {
  return <ItemDetailControl account={account} {...extraProps} />
}

const ItemDetailControl = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(ItemDetail1))
//export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail)
export default ItemDetail
