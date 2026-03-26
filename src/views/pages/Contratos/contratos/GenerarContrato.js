import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import * as propertyActions from 'src/actions/Contratos/propertyActions'
import * as bankAccountActions from 'src/actions/Contratos/bankAccountActions'
import * as ownerActions from 'src/actions/Contratos/ownerActions'
import * as contractActions from 'src/actions/Contratos/contractActions'
import { generateContractPdf, buildContractHtml } from './contractPdf'
import './GenerarContrato.scss'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCOP(raw) {
  const num = String(raw).replace(/\D/g, '')
  return num ? num.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

function parseCOP(display) {
  return String(display).replace(/\./g, '')
}

const emptyForm = {
  tenant_full_name: '',
  tenant_identification_number: '',
  tenant_identification_city: '',
  guarantor_full_name: '',
  guarantor_identification_number: '',
  guarantor_identification_city: '',
  owner_full_name: '',
  owner_identification_number: '',
  owner_identification_city: '',
  property_full_address: '',
  property_address: '',
  property_apartment_number: '',
  property_city: '',
  property_state: '',
  property_urbanization: '',
  rental_value: '',
  rental_duration: '',
  rental_start_date: '',
  contract_city: '',
  contract_date: '',
  account_bank_name: '',
  account_type: '',
  account_number: '',
  account_name: '',
}

function buildPayload(form) {
  return {
    tenant: {
      full_name: form.tenant_full_name,
      identification: {
        number: form.tenant_identification_number,
        city: form.tenant_identification_city,
      },
    },
    guarantor: {
      full_name: form.guarantor_full_name,
      identification: {
        number: form.guarantor_identification_number,
        city: form.guarantor_identification_city,
      },
    },
    owner: {
      full_name: form.owner_full_name,
      identification: {
        number: form.owner_identification_number,
        city: form.owner_identification_city,
      },
    },
    property: {
      full_address: form.property_full_address,
      address: form.property_address || form.property_full_address,
      appartment_number: form.property_apartment_number,
      city: form.property_city,
      state: form.property_state,
      urbanization_name: form.property_urbanization,
    },
    rental: {
      value: parseCOP(form.rental_value),
      duration: form.rental_duration,
      start_date: form.rental_start_date,
    },
    contract: { city: form.contract_city, date: form.contract_date },
    account: {
      bank_name: form.account_bank_name,
      type: form.account_type,
      number: form.account_number,
      name: form.account_name || form.owner_full_name,
    },
  }
}

function fillFormFromDoc(c) {
  return {
    tenant_full_name: c.tenant?.full_name ?? '',
    tenant_identification_number: c.tenant?.identification?.number ?? '',
    tenant_identification_city: c.tenant?.identification?.city ?? '',
    guarantor_full_name: c.guarantor?.full_name ?? '',
    guarantor_identification_number: c.guarantor?.identification?.number ?? '',
    guarantor_identification_city: c.guarantor?.identification?.city ?? '',
    owner_full_name: c.owner?.full_name ?? '',
    owner_identification_number: c.owner?.identification?.number ?? '',
    owner_identification_city: c.owner?.identification?.city ?? '',
    property_full_address: c.property?.full_address ?? '',
    property_address: c.property?.address ?? '',
    property_apartment_number: c.property?.appartment_number ?? '',
    property_city: c.property?.city ?? '',
    property_state: c.property?.state ?? '',
    property_urbanization: c.property?.urbanization_name ?? '',
    rental_value: c.rental?.value ? formatCOP(c.rental.value) : '',
    rental_duration: c.rental?.duration ?? '',
    rental_start_date: c.rental?.start_date ?? '',
    contract_city: c.contract?.city ?? '',
    contract_date: c.contract?.date ?? '',
    account_bank_name: c.account?.bank_name ?? '',
    account_type: c.account?.type ?? '',
    account_number: c.account?.number ?? '',
    account_name: c.account?.name ?? '',
  }
}

// ── SVG icons ──────────────────────────────────────────────────────────────────

const IcoPerson = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
)
const IcoGroup = () => (
  <svg viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
)
const IcoShield = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4.18 5 2.23V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.41l5-2.23z" />
  </svg>
)
const IcoHome = () => (
  <svg viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)
const IcoDoc = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 8H7v-2h4v2zm4-4H7v-2h8v2zm0-4H7V7h8v2z" />
  </svg>
)
const IcoCard = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </svg>
)
const IcoCopy = () => (
  <svg viewBox="0 0 24 24">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </svg>
)
const IcoSwitch = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
  </svg>
)
const IcoSave = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
)
const IcoEye = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34 3-3-3z" />
  </svg>
)
const IcoDownload = () => (
  <svg viewBox="0 0 24 24">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z" />
  </svg>
)
const IcoClose = () => (
  <svg viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)
const IcoTrash = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)
const IcoSpinner = () => (
  <svg viewBox="0 0 24 24" className="spinner" style={{ display: 'block' }}>
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
  </svg>
)
const IcoPlus = () => (
  <svg viewBox="0 0 24 24">
    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)
const IcoPencil = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)
const IcoCheck = () => (
  <svg viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
)

// ── Component ──────────────────────────────────────────────────────────────────

export default function GenerarContrato() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const properties = useSelector((s) => s.contratoProperty.data)
  const bankAccounts = useSelector((s) => s.contratoBankAccount.data)
  const owners = useSelector((s) => s.contratoOwner.data)
  const propertySaving = useSelector((s) => s.contratoProperty.fetching)
  const bankAccountSaving = useSelector((s) => s.contratoBankAccount.fetching)
  const ownerSaving = useSelector((s) => s.contratoOwner.saving)
  const contractsList = useSelector((s) => s.contrato.list)
  const currentDoc = useSelector((s) => s.contrato.current)
  const contractSaving = useSelector((s) => s.contrato.saving)
  const contractLoading = useSelector((s) => s.contrato.loading)
  const contractError = useSelector((s) => s.contrato.isError)

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login', { replace: true })
  }, [navigate])

  // Load all catalogs and contracts list on mount
  useEffect(() => {
    dispatch(propertyActions.fetchRequest())
    dispatch(bankAccountActions.fetchRequest())
    dispatch(ownerActions.fetchRequest())
    dispatch(contractActions.fetchRequest())
  }, [dispatch])

  const [form, setForm] = useState(emptyForm)
  const [currentContract, setCurrentContract] = useState(null) // { id, name }
  const [errors, setErrors] = useState({})

  // Toast
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }

  // Fill form when a contract finishes loading
  const prevLoadingRef = useRef(false)
  useEffect(() => {
    if (prevLoadingRef.current && !contractLoading && currentDoc) {
      setForm(fillFormFromDoc(currentDoc))
      setCurrentContract({ id: currentDoc.id, name: currentDoc.name })
    }
    prevLoadingRef.current = contractLoading
  }, [contractLoading, currentDoc])

  // Detect save/clone completion
  const prevSavingRef = useRef(false)
  useEffect(() => {
    if (prevSavingRef.current && !contractSaving) {
      if (contractError) {
        showToast('Error al guardar el contrato.', 'error')
      } else if (currentDoc) {
        setCurrentContract({ id: currentDoc.id, name: currentDoc.name })
        showToast(`Cambios guardados en "${currentDoc.name}"`, 'success')
      }
    }
    prevSavingRef.current = contractSaving
  }, [contractSaving, contractError, currentDoc])

  // ── Owner combobox ────────────────────────────────────────────────────────────
  const [ownerQuery, setOwnerQuery] = useState('')
  const [ownerOpen, setOwnerOpen] = useState(false)

  const allOwners = owners || []
  const filteredOwners = allOwners.filter((o) => {
    const q = ownerQuery.toLowerCase()
    return o.full_name?.toLowerCase().includes(q) || (o.identification_number || '').includes(q)
  })

  const selectOwner = (o) => {
    setOwnerQuery(o.full_name || '')
    setOwnerOpen(false)
    setForm((prev) => ({
      ...prev,
      owner_full_name: o.full_name || prev.owner_full_name,
      owner_identification_number: o.identification_number || prev.owner_identification_number,
      owner_identification_city: o.identification_city || prev.owner_identification_city,
    }))
  }

  const saveOwner = () => {
    if (!form.owner_full_name.trim()) {
      showToast('Enter owner name before saving.', 'error')
      return
    }
    const payload = {
      full_name: form.owner_full_name.trim(),
      identification_number: form.owner_identification_number.trim(),
      identification_city: form.owner_identification_city.trim(),
    }
    const existing = allOwners.find(
      (o) => o.full_name?.toLowerCase() === payload.full_name.toLowerCase(),
    )
    if (existing) {
      dispatch(ownerActions.updateRequest({ id: existing.id, ...payload }))
      showToast('Owner updated in Contratos_Propietarios.', 'success')
    } else {
      dispatch(ownerActions.createRequest(payload))
      showToast('Owner saved to Contratos_Propietarios.', 'success')
    }
  }

  // ── Properties combobox ───────────────────────────────────────────────────────
  const [aliasQuery, setAliasQuery] = useState('')
  const [aliasOpen, setAliasOpen] = useState(false)
  const [propertyAlias, setPropertyAlias] = useState('')

  const allProperties = properties || []
  const filteredProperties = allProperties.filter((p) => {
    const q = aliasQuery.toLowerCase()
    return (
      p.alias?.toLowerCase().includes(q) ||
      p.full_address?.toLowerCase().includes(q) ||
      (p.appartment_number || '').toLowerCase().includes(q)
    )
  })

  const selectProperty = (p) => {
    setAliasQuery(p.alias || '')
    setPropertyAlias(p.alias || '')
    setAliasOpen(false)
    setForm((prev) => ({
      ...prev,
      property_full_address: p.full_address || prev.property_full_address,
      property_address: p.address || prev.property_address,
      property_apartment_number: p.appartment_number || prev.property_apartment_number,
      property_city: p.city || prev.property_city,
      property_state: p.state || prev.property_state,
      property_urbanization: p.urbanization_name || prev.property_urbanization,
      rental_value: formatCOP(p.default_canon_value ?? 0),
    }))
  }

  const saveProperty = () => {
    if (!form.property_full_address.trim()) {
      showToast('Enter property address before saving.', 'error')
      return
    }
    const resolvedAlias = aliasQuery.trim() || form.property_full_address.trim()
    const payload = {
      alias: resolvedAlias,
      full_address: form.property_full_address.trim(),
      address: form.property_address.trim(),
      appartment_number: form.property_apartment_number.trim(),
      city: form.property_city.trim(),
      state: form.property_state.trim(),
      urbanization_name: form.property_urbanization.trim(),
      default_canon_value: parseCOP(form.rental_value),
    }
    const existing = allProperties.find(
      (p) => p.alias?.toLowerCase() === resolvedAlias.toLowerCase(),
    )
    if (existing) {
      dispatch(propertyActions.updateRequest({ id: existing.id, ...payload }))
      showToast('Property updated in Contratos_Inmuebles.', 'success')
    } else {
      dispatch(propertyActions.createRequest(payload))
      showToast('Property saved to Contratos_Inmuebles.', 'success')
    }
  }

  // ── Bank account combobox ─────────────────────────────────────────────────────
  const [accountQuery, setAccountQuery] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)

  const allBankAccounts = bankAccounts || []
  const filteredBankAccounts = allBankAccounts.filter((a) => {
    const q = accountQuery.toLowerCase()
    return (
      a.bank_name?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      (a.number || '').includes(q)
    )
  })

  const selectBankAccount = (a) => {
    setAccountQuery(`${a.bank_name} — ${a.number}`)
    setAccountOpen(false)
    setForm((prev) => ({
      ...prev,
      account_bank_name: a.bank_name || prev.account_bank_name,
      account_type: a.type || prev.account_type,
      account_number: a.number || prev.account_number,
      account_name: a.name || prev.account_name,
    }))
  }

  const saveBankAccount = () => {
    if (!form.account_bank_name.trim() || !form.account_number.trim()) {
      showToast('Enter bank name and account number before saving.', 'error')
      return
    }
    const payload = {
      bank_name: form.account_bank_name.trim(),
      type: form.account_type.trim(),
      number: form.account_number.trim(),
      name: form.account_name.trim() || form.owner_full_name.trim(),
    }
    const existing = allBankAccounts.find(
      (a) => a.number?.trim() === payload.number,
    )
    if (existing) {
      dispatch(bankAccountActions.updateRequest({ id: existing.id, ...payload }))
      showToast('Bank account updated in Contratos_CuentasBancarias.', 'success')
    } else {
      dispatch(bankAccountActions.createRequest(payload))
      showToast('Bank account saved to Contratos_CuentasBancarias.', 'success')
    }
  }

  // ── Catalog delete handlers ───────────────────────────────────────────────────
  const deleteOwnerItem = (e, id) => {
    e.stopPropagation()
    dispatch(ownerActions.deleteRequest({ id }))
  }

  const deletePropertyItem = (e, id) => {
    e.stopPropagation()
    dispatch(propertyActions.deleteRequest({ id }))
  }

  const deleteBankAccountItem = (e, id) => {
    e.stopPropagation()
    dispatch(bankAccountActions.deleteRequest({ id }))
  }

  // Picker modal
  const [pickerOpen, setPickerOpen] = useState(false)

  const openPicker = () => setPickerOpen(true)

  const selectContract = (item) => {
    dispatch(contractActions.loadRequest({ id: item.id }))
    setPickerOpen(false)
    setRenamingId(null)
  }

  // Rename contract inline in picker
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef(null)

  const startRename = (e, item) => {
    e.stopPropagation()
    setRenamingId(item.id)
    setRenameValue(item.name)
    setTimeout(() => renameInputRef.current?.focus(), 30)
  }

  const confirmRename = (id) => {
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }
    dispatch(contractActions.updateRequest({ id, data: { name: trimmed } }))
    if (currentContract?.id === id) setCurrentContract({ id, name: trimmed })
    setRenamingId(null)
  }

  // Clone modal
  const [cloneOpen, setCloneOpen] = useState(false)
  const [cloneName, setCloneName] = useState('')
  const cloneInputRef = useRef(null)

  const openCloneModal = () => {
    if (!currentContract) {
      showToast('Selecciona un contrato primero.', 'error')
      return
    }
    setCloneName('')
    setCloneOpen(true)
    setTimeout(() => cloneInputRef.current?.focus(), 50)
  }

  const confirmClone = () => {
    if (!cloneName.trim()) return
    dispatch(contractActions.cloneRequest({ sourceId: currentContract.id, name: cloneName.trim() }))
    setCloneOpen(false)
    setCloneName('')
  }

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  const handlePreview = () => {
    setPreviewHtml(buildContractHtml(buildPayload(form), true))
    setPreviewOpen(true)
  }

  // Field helpers
  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }))
  }

  const setRentalValue = (e) => {
    const formatted = formatCOP(e.target.value)
    setForm((prev) => ({ ...prev, rental_value: formatted }))
    if (errors.rental_value) setErrors((prev) => ({ ...prev, rental_value: false }))
  }

  const inputClass = (field) => `c-input${errors[field] ? ' error' : ''}`

  // Validate
  const requiredFields = [
    'tenant_full_name',
    'tenant_identification_number',
    'tenant_identification_city',
    'guarantor_full_name',
    'guarantor_identification_number',
    'guarantor_identification_city',
    'owner_full_name',
    'owner_identification_number',
    'owner_identification_city',
    'property_full_address',
    'property_city',
    'property_state',
    'rental_value',
    'rental_duration',
    'rental_start_date',
    'contract_city',
    'contract_date',
    'account_bank_name',
    'account_type',
    'account_number',
  ]

  const validate = () => {
    const errs = {}
    requiredFields.forEach((f) => {
      if (!form[f]?.toString().trim()) errs[f] = true
    })
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      const firstId = requiredFields.find((f) => errs[f])
      const el = document.querySelector(`[data-field="${firstId}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return Object.keys(errs).length === 0
  }

  // Save to Firestore
  const handleSave = () => {
    if (!currentContract) {
      // Create new contract — ask for name first via clone-style modal
      showToast(
        'Usa "Nuevo contrato" para crear uno nuevo, o abre uno existente antes de guardar.',
        'error',
      )
      return
    }
    dispatch(contractActions.updateRequest({ id: currentContract.id, data: buildPayload(form) }))
  }

  // New contract
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const newInputRef = useRef(null)

  const openNewModal = () => {
    setNewName('')
    setNewOpen(true)
    setTimeout(() => newInputRef.current?.focus(), 50)
  }

  const confirmNew = () => {
    if (!newName.trim()) return
    dispatch(contractActions.createRequest({ name: newName.trim(), data: buildPayload(form) }))
    setNewOpen(false)
    setNewName('')
  }

  // Generate PDF
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!validate()) {
      showToast('Por favor completa todos los campos obligatorios.', 'error')
      return
    }
    setGenerating(true)
    showToast('Generando contrato…', 'info')
    try {
      const filename = currentContract
        ? `Contrato_${currentContract.name.replace(/\s+/g, '_')}.pdf`
        : `Contrato_${form.tenant_full_name.replace(/\s+/g, '_')}.pdf`
      await generateContractPdf(buildPayload(form), filename)
      showToast('¡Contrato generado exitosamente!', 'success')
    } catch (err) {
      showToast('Error al generar el contrato: ' + err.message, 'error')
    } finally {
      setGenerating(false)
    }
  }

  // Sidebar active section
  const [activeSection, setActiveSection] = useState('sec-inquilino')
  const sectionIds = [
    'sec-inquilino',
    'sec-garante',
    'sec-propietario',
    'sec-inmueble',
    'sec-contrato',
    'sec-cuenta',
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const titleText = currentContract ? currentContract.name : 'Contratos de Arrendamiento'

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="contratos-page">
      {/* Header */}
      <header className="contratos-header">
        <h1>{titleText}</h1>
        <span className="subtitle">Colombia &mdash; Generador de documentos</span>
        <button className="c-btn-header" onClick={openNewModal}>
          <IcoPlus /> Nuevo
        </button>
        <button className="c-btn-header" onClick={openCloneModal}>
          <IcoCopy /> Clonar
        </button>
        <button className="c-btn-header" onClick={openPicker}>
          <IcoSwitch /> Cambiar contrato
        </button>
      </header>

      <div className="contratos-layout">
        {/* Sidebar */}
        <nav className="contratos-sidebar">
          <ul>
            {[
              ['#sec-inquilino', 'Inquilino'],
              ['#sec-garante', 'Codeudor'],
              ['#sec-propietario', 'Propietario'],
              ['#sec-inmueble', 'Inmueble'],
              ['#sec-contrato', 'Contrato'],
              ['#sec-cuenta', 'Cuenta bancaria'],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className={activeSection === href.slice(1) ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Form */}
        <main className="contratos-form-main">
          <form className="contratos-form" onSubmit={handleGenerate} noValidate>
            {/* INQUILINO */}
            <section className="c-card" id="sec-inquilino">
              <div className="c-card-header">
                <div className="c-card-icon">
                  <IcoPerson />
                </div>
                <h2>Inquilino (Arrendatario)</h2>
                <p>Datos personales</p>
              </div>
              <div className="c-card-body">
                <div className="c-field full">
                  <label className="c-label">
                    Nombre completo <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('tenant_full_name')}
                    data-field="tenant_full_name"
                    type="text"
                    placeholder="Ej. María Fernanda Gómez Ruiz"
                    value={form.tenant_full_name}
                    onChange={set('tenant_full_name')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Número de cédula <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('tenant_identification_number')}
                    data-field="tenant_identification_number"
                    type="text"
                    placeholder="Ej. 1032456789"
                    inputMode="numeric"
                    value={form.tenant_identification_number}
                    onChange={set('tenant_identification_number')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Ciudad de expedición <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('tenant_identification_city')}
                    data-field="tenant_identification_city"
                    type="text"
                    placeholder="Ej. Medellín"
                    value={form.tenant_identification_city}
                    onChange={set('tenant_identification_city')}
                  />
                </div>
              </div>
            </section>

            {/* GARANTE */}
            <section className="c-card" id="sec-garante">
              <div className="c-card-header">
                <div className="c-card-icon">
                  <IcoGroup />
                </div>
                <h2>Codeudor / Garante</h2>
                <p>Datos personales</p>
              </div>
              <div className="c-card-body">
                <div className="c-field full">
                  <label className="c-label">
                    Nombre completo <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('guarantor_full_name')}
                    data-field="guarantor_full_name"
                    type="text"
                    placeholder="Ej. Carlos Andrés López Mesa"
                    value={form.guarantor_full_name}
                    onChange={set('guarantor_full_name')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Número de cédula <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('guarantor_identification_number')}
                    data-field="guarantor_identification_number"
                    type="text"
                    placeholder="Ej. 71234567"
                    inputMode="numeric"
                    value={form.guarantor_identification_number}
                    onChange={set('guarantor_identification_number')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Ciudad de expedición <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('guarantor_identification_city')}
                    data-field="guarantor_identification_city"
                    type="text"
                    placeholder="Ej. Bogotá D.C."
                    value={form.guarantor_identification_city}
                    onChange={set('guarantor_identification_city')}
                  />
                </div>
              </div>
            </section>

            {/* OWNER */}
            <section className="c-card" id="sec-propietario">
              <div className="c-card-header">
                <div className="c-card-icon">
                  <IcoShield />
                </div>
                <h2>Propietario (Arrendador)</h2>
                <p>Datos del dueño</p>
              </div>
              <div className="c-card-body cols-1">
                <div className="c-field full">
                  <label className="c-label">Saved owners</label>
                  <div className="c-combobox-wrap">
                    <input
                      className="c-input"
                      type="text"
                      placeholder="Search saved owner…"
                      autoComplete="off"
                      value={ownerQuery}
                      onChange={(e) => {
                        setOwnerQuery(e.target.value)
                        setOwnerOpen(true)
                      }}
                      onFocus={() => setOwnerOpen(true)}
                      onBlur={() => setTimeout(() => setOwnerOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setOwnerOpen(false)
                      }}
                    />
                    <ul
                      className={`c-alias-dropdown${ownerOpen && filteredOwners.length > 0 ? ' open' : ''}`}
                    >
                      {filteredOwners.map((o) => (
                        <li
                          key={o.id}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectOwner(o)
                          }}
                        >
                          <IcoShield />
                          <div>
                            <div className="alias-name">{o.full_name}</div>
                            <div className="alias-addr">
                              CC {o.identification_number} — {o.identification_city}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="c-dropdown-delete"
                            onMouseDown={(e) => deleteOwnerItem(e, o.id)}
                            title="Delete owner"
                          >
                            <IcoTrash />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Full name <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('owner_full_name')}
                    data-field="owner_full_name"
                    type="text"
                    placeholder="Ej. Yefrin David Ríos Mora"
                    value={form.owner_full_name}
                    onChange={set('owner_full_name')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    ID number <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('owner_identification_number')}
                    data-field="owner_identification_number"
                    type="text"
                    placeholder="Ej. 1036622381"
                    inputMode="numeric"
                    value={form.owner_identification_number}
                    onChange={set('owner_identification_number')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    ID city <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('owner_identification_city')}
                    data-field="owner_identification_city"
                    type="text"
                    placeholder="Ej. Medellín"
                    value={form.owner_identification_city}
                    onChange={set('owner_identification_city')}
                  />
                </div>
                <div className="c-field full">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={ownerSaving}
                    onClick={saveOwner}
                  >
                    <IcoSave /> Save owner
                  </button>
                </div>
              </div>
            </section>

            {/* INMUEBLE */}
            <section className="c-card" id="sec-inmueble">
              <div className="c-card-header">
                <div className="c-card-icon">
                  <IcoHome />
                </div>
                <h2>Inmueble</h2>
                <p>Datos de la propiedad</p>
              </div>
              <div className="c-card-body">
                <div className="c-field full" id="property-alias-field">
                  <label className="c-label">Inmueble</label>
                  <div className="c-combobox-wrap">
                    <input
                      className="c-input"
                      type="text"
                      placeholder="Buscar inmueble…"
                      autoComplete="off"
                      value={aliasQuery}
                      onChange={(e) => {
                        setAliasQuery(e.target.value)
                        setAliasOpen(true)
                      }}
                      onFocus={() => setAliasOpen(true)}
                      onBlur={() => setTimeout(() => setAliasOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setAliasOpen(false)
                      }}
                    />
                    <ul
                      className={`c-alias-dropdown${aliasOpen && filteredProperties.length > 0 ? ' open' : ''}`}
                    >
                      {filteredProperties.map((p) => (
                        <li
                          key={p.id}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectProperty(p)
                          }}
                        >
                          <IcoHome />
                          <div>
                            <div className="alias-name">{p.alias}</div>
                            <div className="alias-addr">
                              {p.full_address}
                              {p.appartment_number ? ` · Apto ${p.appartment_number}` : ''}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="c-dropdown-delete"
                            onMouseDown={(e) => deletePropertyItem(e, p.id)}
                            title="Delete property"
                          >
                            <IcoTrash />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="c-field full">
                  <label className="c-label">
                    Dirección completa <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('property_full_address')}
                    data-field="property_full_address"
                    type="text"
                    placeholder="Ej. Carrera 33 #43-63 Medellín - Antioquia"
                    value={form.property_full_address}
                    onChange={set('property_full_address')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">Dirección corta</label>
                  <input
                    className="c-input"
                    type="text"
                    placeholder="Ej. Carrera 33 #43-63"
                    value={form.property_address}
                    onChange={set('property_address')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">Número apartamento</label>
                  <input
                    className="c-input"
                    type="text"
                    placeholder="Ej. 106"
                    inputMode="numeric"
                    value={form.property_apartment_number}
                    onChange={set('property_apartment_number')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Ciudad <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('property_city')}
                    data-field="property_city"
                    type="text"
                    placeholder="Ej. Medellín"
                    value={form.property_city}
                    onChange={set('property_city')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Departamento <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('property_state')}
                    data-field="property_state"
                    type="text"
                    placeholder="Ej. Antioquia"
                    value={form.property_state}
                    onChange={set('property_state')}
                  />
                </div>
                <div className="c-field full">
                  <label className="c-label">Urbanization / complex name</label>
                  <input
                    className="c-input"
                    type="text"
                    placeholder="Ej. Caminos de San Patricio"
                    value={form.property_urbanization}
                    onChange={set('property_urbanization')}
                  />
                </div>
                <div className="c-field full">
                  <label className="c-label">Alias (name to save in catalog)</label>
                  <input
                    className="c-input"
                    type="text"
                    placeholder="Ej. Casa Laureles 106"
                    value={propertyAlias}
                    onChange={(e) => setPropertyAlias(e.target.value)}
                  />
                </div>
                <div className="c-field full">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={propertySaving}
                    onClick={saveProperty}
                  >
                    <IcoSave /> Save property
                  </button>
                </div>
              </div>
            </section>

            {/* CONTRATO */}
            <section className="c-card" id="sec-contrato">
              <div className="c-card-header">
                <div className="c-card-icon">
                  <IcoDoc />
                </div>
                <h2>Contrato de Arrendamiento</h2>
                <p>Condiciones económicas</p>
              </div>
              <div className="c-card-body cols-3">
                <div className="c-field">
                  <label className="c-label">
                    Valor arriendo <span className="req">*</span>
                  </label>
                  <div className="c-currency-wrap">
                    <span className="c-currency-symbol">$</span>
                    <input
                      className={inputClass('rental_value')}
                      data-field="rental_value"
                      type="text"
                      placeholder="0"
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.rental_value}
                      onChange={setRentalValue}
                    />
                  </div>
                  <span className="c-hint">Pesos colombianos (COP)</span>
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Duración (meses) <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('rental_duration')}
                    data-field="rental_duration"
                    type="number"
                    placeholder="Ej. 12"
                    min="1"
                    max="120"
                    value={form.rental_duration}
                    onChange={set('rental_duration')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Fecha inicio <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('rental_start_date')}
                    data-field="rental_start_date"
                    type="date"
                    value={form.rental_start_date}
                    onChange={set('rental_start_date')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Ciudad del contrato <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('contract_city')}
                    data-field="contract_city"
                    type="text"
                    placeholder="Ej. Medellín"
                    value={form.contract_city}
                    onChange={set('contract_city')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Fecha del contrato <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('contract_date')}
                    data-field="contract_date"
                    type="date"
                    value={form.contract_date}
                    onChange={set('contract_date')}
                  />
                </div>
              </div>
            </section>

            {/* BANK ACCOUNT */}
            <section className="c-card" id="sec-cuenta">
              <div className="c-card-header">
                <div className="c-card-icon">
                  <IcoCard />
                </div>
                <h2>Cuenta Bancaria</h2>
                <p>Para pago del arriendo</p>
              </div>
              <div className="c-card-body">
                <div className="c-field full">
                  <label className="c-label">Saved accounts</label>
                  <div className="c-combobox-wrap">
                    <input
                      className="c-input"
                      type="text"
                      placeholder="Search saved bank account…"
                      autoComplete="off"
                      value={accountQuery}
                      onChange={(e) => {
                        setAccountQuery(e.target.value)
                        setAccountOpen(true)
                      }}
                      onFocus={() => setAccountOpen(true)}
                      onBlur={() => setTimeout(() => setAccountOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setAccountOpen(false)
                      }}
                    />
                    <ul
                      className={`c-alias-dropdown${accountOpen && filteredBankAccounts.length > 0 ? ' open' : ''}`}
                    >
                      {filteredBankAccounts.map((a) => (
                        <li
                          key={a.id}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectBankAccount(a)
                          }}
                        >
                          <IcoCard />
                          <div>
                            <div className="alias-name">
                              {a.bank_name} — {a.type}
                            </div>
                            <div className="alias-addr">
                              {a.number} · {a.name}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="c-dropdown-delete"
                            onMouseDown={(e) => deleteBankAccountItem(e, a.id)}
                            title="Delete account"
                          >
                            <IcoTrash />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Bank name <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('account_bank_name')}
                    data-field="account_bank_name"
                    type="text"
                    placeholder="Ej. Bancolombia"
                    value={form.account_bank_name}
                    onChange={set('account_bank_name')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Account type <span className="req">*</span>
                  </label>
                  <div className="c-select-wrap">
                    <select
                      className={`c-select${errors.account_type ? ' error' : ''}`}
                      data-field="account_type"
                      value={form.account_type}
                      onChange={set('account_type')}
                    >
                      <option value="">Select…</option>
                      <option value="ahorros">Cuenta de Ahorros</option>
                      <option value="corriente">Cuenta Corriente</option>
                      <option value="Nequi">Nequi</option>
                      <option value="Daviplata">Daviplata</option>
                    </select>
                  </div>
                </div>
                <div className="c-field">
                  <label className="c-label">
                    Account number <span className="req">*</span>
                  </label>
                  <input
                    className={inputClass('account_number')}
                    data-field="account_number"
                    type="text"
                    placeholder="Ej. 3134792283"
                    inputMode="numeric"
                    value={form.account_number}
                    onChange={set('account_number')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">Account holder name</label>
                  <input
                    className="c-input"
                    type="text"
                    placeholder="Ej. Yefrin David Ríos Mora"
                    value={form.account_name}
                    onChange={set('account_name')}
                  />
                </div>
                <div className="c-field full">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={bankAccountSaving}
                    onClick={saveBankAccount}
                  >
                    <IcoSave /> Save account
                  </button>
                </div>
              </div>
            </section>

            {/* SUBMIT BAR */}
            <div className="c-submit-bar">
              <p>
                Al hacer clic en <strong>Generar Contrato</strong> se creará el documento PDF listo
                para imprimir y firmar. El archivo se descargará automáticamente.
              </p>
              <div className="c-submit-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={contractSaving}
                  onClick={handleSave}
                >
                  {contractSaving ? <IcoSpinner /> : <IcoSave />}
                  Guardar cambios
                </button>
                <button type="button" className="btn-secondary" onClick={handlePreview}>
                  <IcoEye /> Vista previa
                </button>
                <button
                  type="submit"
                  className={`btn-generate${generating ? ' loading' : ''}`}
                  disabled={generating}
                >
                  <IcoDownload />
                  <span className="btn-text">Generar Contrato</span>
                  <div className="spinner" />
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Toast */}
      <div className={`c-toast${toast ? ' show' : ''}${toast ? ' ' + toast.type : ''}`}>
        <div className="c-toast-dot" />
        <span>{toast?.msg}</span>
      </div>

      {/* Contract picker modal */}
      {pickerOpen && (
        <div
          className="c-overlay"
          onClick={(e) => e.target === e.currentTarget && setPickerOpen(false)}
        >
          <div className="c-picker">
            <div className="c-picker-header">
              <div className="c-card-icon" style={{ width: 40, height: 40 }}>
                <IcoDoc />
              </div>
              <div>
                <h2>¿Qué contrato vamos a ejecutar?</h2>
                <p>Contratos guardados en Firebase</p>
              </div>
            </div>
            <div className="c-picker-list">
              {!contractsList ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando…
                </div>
              ) : contractsList.length === 0 ? (
                <div className="c-picker-empty">
                  <p>
                    No hay contratos guardados aún. Usa <strong>Nuevo</strong> para crear uno.
                  </p>
                </div>
              ) : (
                contractsList.map((item) =>
                  renamingId === item.id ? (
                    <div key={item.id} className="c-picker-item c-picker-item--renaming">
                      <IcoDoc />
                      <input
                        ref={renameInputRef}
                        className="c-input"
                        style={{ flex: 1, height: 34, fontSize: '.9rem' }}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename(item.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="button"
                        className="c-dropdown-delete"
                        style={{ color: 'var(--gold)' }}
                        onMouseDown={(e) => { e.stopPropagation(); confirmRename(item.id) }}
                        title="Confirmar nombre"
                      >
                        <IcoCheck />
                      </button>
                      <button
                        type="button"
                        className="c-dropdown-delete"
                        onMouseDown={(e) => { e.stopPropagation(); setRenamingId(null) }}
                        title="Cancelar"
                      >
                        <IcoClose />
                      </button>
                    </div>
                  ) : (
                    <div key={item.id} className="c-picker-item" onClick={() => selectContract(item)}>
                      <IcoDoc />
                      <span>{item.name}</span>
                      <button
                        type="button"
                        className="c-dropdown-delete"
                        onMouseDown={(e) => startRename(e, item)}
                        title="Renombrar contrato"
                      >
                        <IcoPencil />
                      </button>
                      <span className="arrow">→</span>
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* New contract modal */}
      {newOpen && (
        <div
          className="c-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setNewOpen(false)
              setNewName('')
            }
          }}
        >
          <div className="c-clone-modal">
            <div className="c-clone-header">
              <div className="c-card-icon" style={{ width: 36, height: 36 }}>
                <IcoPlus />
              </div>
              <div>
                <h2>Nuevo contrato</h2>
                <p>Se guardará con los datos actuales del formulario</p>
              </div>
            </div>
            <div className="c-clone-body">
              <div className="c-field">
                <label className="c-label">
                  Nombre del contrato <span className="req">*</span>
                </label>
                <input
                  ref={newInputRef}
                  className="c-input"
                  type="text"
                  placeholder="Ej. Juan Pérez 2025"
                  autoComplete="off"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmNew()
                    if (e.key === 'Escape') {
                      setNewOpen(false)
                      setNewName('')
                    }
                  }}
                />
              </div>
              <div className="c-clone-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setNewOpen(false)
                    setNewName('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`btn-generate${contractSaving ? ' loading' : ''}`}
                  style={{ padding: '10px 22px' }}
                  disabled={contractSaving || !newName.trim()}
                  onClick={confirmNew}
                >
                  <IcoSave />
                  <span className="btn-text">Crear</span>
                  <div className="spinner" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clone modal */}
      {cloneOpen && (
        <div
          className="c-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCloneOpen(false)
              setCloneName('')
            }
          }}
        >
          <div className="c-clone-modal">
            <div className="c-clone-header">
              <div className="c-card-icon" style={{ width: 36, height: 36 }}>
                <IcoCopy />
              </div>
              <div>
                <h2>Clonar contrato</h2>
                <p>Basado en: {currentContract?.name}</p>
              </div>
            </div>
            <div className="c-clone-body">
              <div className="c-field">
                <label className="c-label">
                  Nombre del nuevo contrato <span className="req">*</span>
                </label>
                <input
                  ref={cloneInputRef}
                  className="c-input"
                  type="text"
                  placeholder="Ej. Nuevo inquilino 2025"
                  autoComplete="off"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmClone()
                    if (e.key === 'Escape') {
                      setCloneOpen(false)
                      setCloneName('')
                    }
                  }}
                />
              </div>
              <div className="c-clone-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setCloneOpen(false)
                    setCloneName('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`btn-generate${contractSaving ? ' loading' : ''}`}
                  style={{ padding: '10px 22px' }}
                  disabled={contractSaving || !cloneName.trim()}
                  onClick={confirmClone}
                >
                  <IcoCopy />
                  <span className="btn-text">Crear clon</span>
                  <div className="spinner" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewOpen && (
        <div className="c-overlay c-overlay--preview">
          <div className="c-preview-modal">
            <div className="c-preview-topbar">
              <span>{titleText} — Vista previa</span>
              <button onClick={() => setPreviewOpen(false)}>
                <IcoClose />
              </button>
            </div>
            <iframe
              className="c-preview-frame"
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
              title="Vista previa contrato"
            />
          </div>
        </div>
      )}
    </div>
  )
}
