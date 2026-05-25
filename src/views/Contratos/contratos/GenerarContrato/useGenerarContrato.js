import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import * as propertyActions from 'src/actions/contratos/propertyActions'
import * as bankAccountActions from 'src/actions/contratos/bankAccountActions'
import * as ownerActions from 'src/actions/contratos/ownerActions'
import * as contractActions from 'src/actions/contratos/contractActions'
import * as contractNoteActions from 'src/actions/contratos/contractNoteActions'
import * as contractAttachmentActions from 'src/actions/contratos/contractAttachmentActions'
import { generateContractPdf, buildContractHtml } from '../contractPdf'
import { authStorage } from 'src/utils/storage'
import { generateActaEntregaPdf, buildActaEntregaHtml } from '../templates/actaEntrega'
import { generateInventarioPdf, buildInventarioHtml } from '../templates/inventario'
import {
  generateAutorizacionIngresoPdf,
  buildAutorizacionIngresoHtml,
} from '../templates/autorizacionIngreso'
import {
  generateAutorizacionEgresoPdf,
  buildAutorizacionEgresoHtml,
} from '../templates/autorizacionEgreso'
import {
  formatCOP,
  parseCOP,
  emptyForm,
  buildPayload,
  fillFormFromDoc,
} from './helpers'
import { uploadImage, MAX_IMAGE_BYTES } from 'src/services/facade/imageFacade'

export function useGenerarContrato() {
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
  const pageLoading =
    properties === null || owners === null || bankAccounts === null || contractsList === null
  const contractLoading = useSelector((s) => s.contrato.loading)
  const contractError = useSelector((s) => s.contrato.isError)
  const contractNotes = useSelector((s) => s.contratoNote.notes)
  const contractNoteSaving = useSelector((s) => s.contratoNote.saving)
  const attachments = useSelector((s) => s.contratoAttachment.data)
  const attachmentSaving = useSelector((s) => s.contratoAttachment.saving)
  const attachmentFetching = useSelector((s) => s.contratoAttachment.fetching)

  useEffect(() => {
    if (!authStorage.getToken()) navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    dispatch(propertyActions.fetchRequest())
    dispatch(bankAccountActions.fetchRequest())
    dispatch(ownerActions.fetchRequest())
    dispatch(contractActions.fetchRequest())
  }, [dispatch])

  const [searchParams, setSearchParams] = useSearchParams()
  const [form, setForm] = useState(emptyForm)
  const [currentContract, setCurrentContract] = useState(null)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) dispatch(contractActions.loadRequest({ id }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [errors, setErrors] = useState({})

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }

  const prevLoadingRef = useRef(false)
  useEffect(() => {
    if (prevLoadingRef.current && !contractLoading && currentDoc) {
      setForm(fillFormFromDoc(currentDoc))
      setCurrentContract({ id: currentDoc.id, name: currentDoc.name })
    }
    prevLoadingRef.current = contractLoading
  }, [contractLoading, currentDoc])

  useEffect(() => {
    if (currentContract?.id) {
      setSearchParams({ id: currentContract.id }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [currentContract?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentContract?.id) {
      dispatch(contractAttachmentActions.fetchRequest({ contractId: currentContract.id }))
      dispatch(contractNoteActions.fetchRequest({ contractId: currentContract.id }))
    }
  }, [currentContract?.id, dispatch])

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

  // Owner combobox
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

  // Properties combobox
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

  // Bank account combobox
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
    const existing = allBankAccounts.find((a) => a.number?.trim() === payload.number)
    if (existing) {
      dispatch(bankAccountActions.updateRequest({ id: existing.id, ...payload }))
      showToast('Bank account updated in Contratos_CuentasBancarias.', 'success')
    } else {
      dispatch(bankAccountActions.createRequest(payload))
      showToast('Bank account saved to Contratos_CuentasBancarias.', 'success')
    }
  }

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

  const [pickerOpen, setPickerOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [cloneOpen, setCloneOpen] = useState(false)

  const handlePickerSelect = (item, renameOnly = false, closeModal = false) => {
    if (!renameOnly) dispatch(contractActions.loadRequest({ id: item.id }))
    if (renameOnly && currentContract?.id === item.id) {
      setCurrentContract({ id: item.id, name: item.name })
    }
    if (closeModal === true) {
      setPickerOpen(false)
    }
  }

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
      const val = form[f]
      const isInvalid =
        val === null || val === undefined || (typeof val === 'string' && !val.trim())
      if (isInvalid) errs[f] = true
    })
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      const firstId = requiredFields.find((f) => errs[f])
      const el = document.querySelector(`[data-field="${firstId}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!currentContract) {
      showToast(
        'Usa "Nuevo contrato" para crear uno nuevo, o abre uno existente antes de guardar.',
        'error',
      )
      return
    }
    dispatch(contractActions.updateRequest({ id: currentContract.id, data: buildPayload(form) }))
  }

  const handleAttachFiles = async (files) => {
    if (!currentContract) return
    for (const file of Array.from(files)) {
      if (file.size > MAX_IMAGE_BYTES) {
        showToast(`"${file.name}" supera el límite de 5 MB.`, 'error')
        continue
      }
      const isPdf = file.type === 'application/pdf'
      const isImage = file.type.startsWith('image/')
      if (!isPdf && !isImage) {
        showToast(`"${file.name}" no es una imagen ni PDF.`, 'error')
        continue
      }
      try {
        const data = await uploadImage(file)
        dispatch(
          contractAttachmentActions.createRequest({
            contractId: currentContract.id,
            filename: file.name,
            data,
          }),
        )
      } catch (e) {
        showToast(`Error procesando "${file.name}": ${e.message}`, 'error')
      }
    }
  }

  const [activeSection, setActiveSection] = useState('sec-inquilino')
  const sectionIds = [
    'sec-inquilino',
    'sec-garante',
    'sec-propietario',
    'sec-inmueble',
    'sec-contrato',
    'sec-cuenta',
    'sec-adjuntos',
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

  const [generatingTemplate, setGeneratingTemplate] = useState(null)
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false)
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState('')
  const [templatePreviewTitle, setTemplatePreviewTitle] = useState('')

  const templates = [
    {
      id: 'contrato',
      label: 'Contrato de Arrendamiento',
      buildHtml: (payload) => buildContractHtml(payload, true),
      generatePdf: generateContractPdf,
      filename: (name) => `Contrato_${(name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`,
      requiresValidation: true,
    },
    {
      id: 'acta-entrega',
      label: 'Acta de entrega',
      buildHtml: buildActaEntregaHtml,
      generatePdf: generateActaEntregaPdf,
      filename: (name) => `ActaEntrega_${(name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`,
    },
    {
      id: 'inventario',
      label: 'Inventario',
      buildHtml: buildInventarioHtml,
      generatePdf: generateInventarioPdf,
      filename: (name) => `Inventario_${(name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`,
    },
    {
      id: 'autorizacion-ingreso',
      label: 'Autorización Ingreso Nuevo Inquilino',
      buildHtml: buildAutorizacionIngresoHtml,
      generatePdf: generateAutorizacionIngresoPdf,
      filename: (name) => `AutorizacionIngreso_${(name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`,
      fixedOwnerId: 'CA035OjLAaJJTHV7XMw5',
    },
    {
      id: 'autorizacion-egreso',
      label: 'Autorización de Egreso',
      buildHtml: buildAutorizacionEgresoHtml,
      generatePdf: generateAutorizacionEgresoPdf,
      filename: (name) => `AutorizacionEgreso_${(name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`,
      fixedOwnerId: 'CA035OjLAaJJTHV7XMw5',
    },
  ]

  const resolvePayload = (tpl) => {
    const payload = buildPayload(form)
    if (tpl.fixedOwnerId) {
      const fixedOwner = (owners || []).find((o) => o.id === tpl.fixedOwnerId)
      if (fixedOwner) {
        payload.owner = {
          full_name: fixedOwner.full_name,
          identification: {
            number: fixedOwner.identification_number,
            city: fixedOwner.identification_city,
          },
        }
      }
    }
    return payload
  }

  const handleTemplatePreview = (tpl) => {
    if (!currentContract) {
      showToast('Selecciona un contrato antes de previsualizar la plantilla.', 'error')
      return
    }
    setTemplatePreviewHtml(tpl.buildHtml(resolvePayload(tpl)))
    setTemplatePreviewTitle(tpl.label)
    setTemplatePreviewOpen(true)
  }

  const handleTemplateGenerate = async (tpl) => {
    if (!currentContract) {
      showToast('Selecciona un contrato antes de generar la plantilla.', 'error')
      return
    }
    if (tpl.requiresValidation && !validate()) {
      showToast('Por favor completa todos los campos obligatorios.', 'error')
      return
    }
    setGeneratingTemplate(tpl.id)
    showToast(`Generando ${tpl.label}…`, 'info')
    try {
      const contractName = currentContract?.name || form.tenant_full_name
      await tpl.generatePdf(resolvePayload(tpl), tpl.filename(contractName))
      showToast(`¡${tpl.label} generada exitosamente!`, 'success')
    } catch (err) {
      showToast(`Error al generar ${tpl.label}: ` + err.message, 'error')
    } finally {
      setGeneratingTemplate(null)
    }
  }

  const titleText =
    currentContract && typeof currentContract.name === 'string'
      ? currentContract.name
      : 'Contratos de Arrendamiento'

  const handleCreate = (name) => {
    dispatch(contractActions.createRequest({ name, data: buildPayload(form) }))
  }

  const handleClone = (name) => {
    dispatch(contractActions.cloneRequest({ sourceId: currentContract.id, name }))
  }

  const handleCloneOpen = () => {
    if (!currentContract) {
      showToast('Selecciona un contrato primero.', 'error')
      return
    }
    setCloneOpen(true)
  }

  return {
    // Redux state
    dispatch,
    properties,
    bankAccounts,
    owners,
    propertySaving,
    bankAccountSaving,
    ownerSaving,
    contractsList,
    currentDoc,
    contractSaving,
    pageLoading,
    contractLoading,
    contractNotes,
    contractNoteSaving,
    attachments,
    attachmentSaving,
    attachmentFetching,
    // Form state
    form,
    errors,
    set,
    setRentalValue,
    inputClass,
    // Contract state
    currentContract,
    setCurrentContract,
    toast,
    titleText,
    // Picker modals
    pickerOpen,
    setPickerOpen,
    newOpen,
    setNewOpen,
    cloneOpen,
    setCloneOpen,
    handlePickerSelect,
    // Owner combobox
    ownerQuery,
    setOwnerQuery,
    ownerOpen,
    setOwnerOpen,
    filteredOwners,
    selectOwner,
    saveOwner,
    deleteOwnerItem,
    // Property combobox
    aliasQuery,
    setAliasQuery,
    aliasOpen,
    setAliasOpen,
    propertyAlias,
    setPropertyAlias,
    filteredProperties,
    selectProperty,
    saveProperty,
    deletePropertyItem,
    // Bank account combobox
    accountQuery,
    setAccountQuery,
    accountOpen,
    setAccountOpen,
    filteredBankAccounts,
    selectBankAccount,
    saveBankAccount,
    deleteBankAccountItem,
    // Actions
    validate,
    handleSave,
    handleCreate,
    handleClone,
    handleCloneOpen,
    handleAttachFiles,
    // Navigation
    activeSection,
    // Templates
    templates,
    generatingTemplate,
    templatePreviewOpen,
    setTemplatePreviewOpen,
    templatePreviewHtml,
    templatePreviewTitle,
    handleTemplatePreview,
    handleTemplateGenerate,
  }
}
