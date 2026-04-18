import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import * as propertyActions from 'src/actions/contratos/propertyActions'
import * as bankAccountActions from 'src/actions/contratos/bankAccountActions'
import * as ownerActions from 'src/actions/contratos/ownerActions'
import * as contractActions from 'src/actions/contratos/contractActions'
import * as contractNoteActions from 'src/actions/contratos/contractNoteActions'
import * as contractAttachmentActions from 'src/actions/contratos/contractAttachmentActions'
import { generateContractPdf, buildContractHtml } from '../contractPdf'
import { generateActaEntregaPdf, buildActaEntregaHtml } from '../templates/actaEntrega'
import { generateInventarioPdf, buildInventarioHtml } from '../templates/inventario'
import { CLink } from '@coreui/react'
import {
  formatCOP,
  parseCOP,
  emptyForm,
  buildPayload,
  fillFormFromDoc,
  compressImage,
  pdfToSingleImage,
  MAX_FILE_BYTES,
} from './helpers'
import {
  IcoPerson,
  IcoGroup,
  IcoShield,
  IcoHome,
  IcoDoc,
  IcoCard,
  IcoCopy,
  IcoSwitch,
  IcoSave,
  IcoEye,
  IcoDownload,
  IcoClose,
  IcoTrash,
  IcoSpinner,
  IcoPlus,
  IcoPencil,
  IcoNote,
} from './icons'
import NotesSection from './NotesSection'
import AttachmentsSection from './AttachmentsSection'
import ContractPickerModal from './ContractPickerModal'
import NameModal from './NameModal'
import '../GenerarContrato.scss'

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
    if (!localStorage.getItem('token')) navigate('/login', { replace: true })
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

  // ── Owner combobox ─────────────────────────────────────────────────────────────
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

  // ── Properties combobox ────────────────────────────────────────────────────────
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

  // ── Bank account combobox ──────────────────────────────────────────────────────
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
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  const handlePickerSelect = (item, renameOnly = false) => {
    if (!renameOnly) dispatch(contractActions.loadRequest({ id: item.id }))
    if (renameOnly && currentContract?.id === item.id) {
      setCurrentContract({ id: item.id, name: item.name })
    }
    setPickerOpen(false)
  }

  const handlePreview = () => {
    setPreviewHtml(buildContractHtml(buildPayload(form), true))
    setPreviewOpen(true)
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
      if (file.size > MAX_FILE_BYTES) {
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
        const data = isPdf ? await pdfToSingleImage(file) : await compressImage(file)
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

  const [generating, setGenerating] = useState(false)
  const [generatingTemplate, setGeneratingTemplate] = useState(null)
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false)
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState('')
  const [templatePreviewTitle, setTemplatePreviewTitle] = useState('')

  const templates = [
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
  ]

  const handleTemplatePreview = (tpl) => {
    if (!currentContract) {
      showToast('Selecciona un contrato antes de previsualizar la plantilla.', 'error')
      return
    }
    setTemplatePreviewHtml(tpl.buildHtml(buildPayload(form)))
    setTemplatePreviewTitle(tpl.label)
    setTemplatePreviewOpen(true)
  }

  const handleTemplateGenerate = async (tpl) => {
    if (!currentContract) {
      showToast('Selecciona un contrato antes de generar la plantilla.', 'error')
      return
    }
    setGeneratingTemplate(tpl.id)
    showToast(`Generando ${tpl.label}…`, 'info')
    try {
      const contractName = currentContract?.name || form.tenant_full_name
      await tpl.generatePdf(buildPayload(form), tpl.filename(contractName))
      showToast(`¡${tpl.label} generada exitosamente!`, 'success')
    } catch (err) {
      showToast(`Error al generar ${tpl.label}: ` + err.message, 'error')
    } finally {
      setGeneratingTemplate(null)
    }
  }

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

  const titleText =
    currentContract && typeof currentContract.name === 'string'
      ? currentContract.name
      : 'Contratos de Arrendamiento'

  return (
    <div className="contratos-page">
      {pageLoading && (
        <div className="c-page-loader">
          <div className="c-page-loader-box">
            <div className="c-page-loader-ring" />
            <span>Cargando datos…</span>
          </div>
        </div>
      )}

      <header className="contratos-header">
        <CLink href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>{titleText}</h1>
        </CLink>
        <span className="subtitle">Colombia &mdash; Generador de documentos</span>
        <button className="c-btn-header" onClick={() => setNewOpen(true)}>
          <IcoPlus /> Nuevo
        </button>
        <button
          className="c-btn-header"
          onClick={() => {
            if (!currentContract) {
              showToast('Selecciona un contrato primero.', 'error')
              return
            }
            setCloneOpen(true)
          }}
        >
          <IcoCopy /> Clonar
        </button>
        <button className="c-btn-header" onClick={() => setPickerOpen(true)}>
          <IcoSwitch /> Seleccionar Contrato
        </button>
      </header>

      <div className="contratos-layout">
        <nav className="contratos-sidebar">
          <ul>
            {[
              ['#sec-inquilino', 'Inquilino'],
              ['#sec-garante', 'Codeudor'],
              ['#sec-propietario', 'Propietario'],
              ['#sec-inmueble', 'Inmueble'],
              ['#sec-contrato', 'Contrato'],
              ['#sec-cuenta', 'Cuenta bancaria'],
              ...(currentContract ? [['#sec-notas', 'Notas']] : []),
              ...(currentContract ? [['#sec-adjuntos', 'Adjuntos']] : []),
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

            {/* PROPIETARIO */}
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

            {/* CUENTA BANCARIA */}
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

            {currentContract && (
              <NotesSection
                contractId={currentContract.id}
                notes={contractNotes}
                saving={contractNoteSaving}
              />
            )}

            {currentContract && (
              <AttachmentsSection
                contractId={currentContract.id}
                attachments={attachments}
                saving={attachmentSaving}
                fetching={attachmentFetching}
                onAttachFiles={handleAttachFiles}
              />
            )}

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

            {/* TEMPLATES BAR */}
            <div className="c-templates-bar">
              <span className="c-templates-title">Plantillas</span>
              <div className="c-templates-list">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="c-template-item">
                    <span className="c-template-label">{tpl.label}</span>
                    <div className="c-template-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleTemplatePreview(tpl)}
                      >
                        <IcoEye /> Vista previa
                      </button>
                      <button
                        type="button"
                        className={`btn-generate${generatingTemplate === tpl.id ? ' loading' : ''}`}
                        disabled={generatingTemplate === tpl.id}
                        onClick={() => handleTemplateGenerate(tpl)}
                      >
                        <IcoDownload />
                        <span className="btn-text">Generar</span>
                        <div className="spinner" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </main>
      </div>

      <div className={`c-toast${toast ? ' show' : ''}${toast ? ' ' + toast.type : ''}`}>
        <div className="c-toast-dot" />
        <span>{toast?.msg}</span>
      </div>

      {pickerOpen && (
        <ContractPickerModal
          contracts={contractsList}
          onSelect={handlePickerSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {newOpen && (
        <NameModal
          icon={<IcoPlus />}
          title="Nuevo contrato"
          subtitle="Se guardará con los datos actuales del formulario"
          placeholder="Ej. Juan Pérez 2025"
          confirmLabel="Crear"
          saving={contractSaving}
          onConfirm={(name) => {
            dispatch(contractActions.createRequest({ name, data: buildPayload(form) }))
            setNewOpen(false)
          }}
          onCancel={() => setNewOpen(false)}
        />
      )}

      {cloneOpen && (
        <NameModal
          icon={<IcoCopy />}
          title="Clonar contrato"
          subtitle={`Basado en: ${currentContract?.name}`}
          placeholder="Ej. Nuevo inquilino 2025"
          confirmLabel="Crear clon"
          confirmIcon={<IcoCopy />}
          saving={contractSaving}
          onConfirm={(name) => {
            dispatch(contractActions.cloneRequest({ sourceId: currentContract.id, name }))
            setCloneOpen(false)
          }}
          onCancel={() => setCloneOpen(false)}
        />
      )}

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

      {templatePreviewOpen && (
        <div className="c-overlay c-overlay--preview">
          <div className="c-preview-modal">
            <div className="c-preview-topbar">
              <span>{templatePreviewTitle} — Vista previa</span>
              <button onClick={() => setTemplatePreviewOpen(false)}>
                <IcoClose />
              </button>
            </div>
            <iframe
              className="c-preview-frame"
              srcDoc={templatePreviewHtml}
              sandbox="allow-same-origin"
              title="Vista previa plantilla"
            />
          </div>
        </div>
      )}
    </div>
  )
}
