import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONTRATOS_API_URL } from 'src/config'
import './GenerarContrato.scss'

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function fillFormFromConfig(c) {
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

// ── SVG icons ─────────────────────────────────────────────────────────────────

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

const IcoSpinner = () => (
  <svg viewBox="0 0 24 24" className="spinner" style={{ display: 'block' }}>
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
  </svg>
)

// ── Component ──────────────────────────────────────────────────────────────────

export default function GenerarContrato() {
  const navigate = useNavigate()

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const [form, setForm] = useState(emptyForm)
  const [currentFile, setCurrentFile] = useState('')
  const [errors, setErrors] = useState({})

  // Toast
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }

  // Properties combobox
  const [allProperties, setAllProperties] = useState([])
  const [aliasQuery, setAliasQuery] = useState('')
  const [aliasOpen, setAliasOpen] = useState(false)

  // Picker modal
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerFiles, setPickerFiles] = useState([])
  const [pickerDir, setPickerDir] = useState('')
  const [pickerLoading, setPickerLoading] = useState(false)

  // Clone modal
  const [cloneOpen, setCloneOpen] = useState(false)
  const [cloneName, setCloneName] = useState('')
  const [cloneLoading, setCloneLoading] = useState(false)
  const cloneInputRef = useRef(null)

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  // Submit states
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sidebar active section via IntersectionObserver
  const [activeSection, setActiveSection] = useState('sec-inquilino')
  const sectionIds = ['sec-inquilino', 'sec-garante', 'sec-propietario', 'sec-inmueble', 'sec-contrato', 'sec-cuenta']

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

  // Load properties on mount
  useEffect(() => {
    fetch(`${CONTRATOS_API_URL}/api/properties`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setAllProperties)
      .catch(() => {})
  }, [])

  // Open picker
  const openPicker = async () => {
    setPickerLoading(true)
    setPickerOpen(true)
    try {
      const res = await fetch(`${CONTRATOS_API_URL}/api/contracts`)
      if (!res.ok) throw new Error('No se pudo listar contratos')
      const { dir, files } = await res.json()
      setPickerDir(dir)
      setPickerFiles(files || [])
    } catch (err) {
      showToast('Error listando contratos: ' + err.message, 'error')
      setPickerOpen(false)
    } finally {
      setPickerLoading(false)
    }
  }

  const selectContract = async (file) => {
    try {
      const res = await fetch(`${CONTRATOS_API_URL}/api/config?file=${encodeURIComponent(file)}`)
      if (!res.ok) throw new Error(await res.text())
      const cfg = await res.json()
      setForm(fillFormFromConfig(cfg))
      setCurrentFile(file)
      setAliasQuery(cfg.property?.alias ?? '')
      setPickerOpen(false)
    } catch (err) {
      showToast('Error cargando contrato: ' + err.message, 'error')
    }
  }

  // Property combobox
  const filteredProperties = allProperties.filter((p) => {
    const q = aliasQuery.toLowerCase()
    return (
      p.alias?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      (p.appartment_number || '').toLowerCase().includes(q)
    )
  })

  const selectProperty = (p) => {
    setAliasQuery(p.alias || '')
    setAliasOpen(false)
    setForm((prev) => ({
      ...prev,
      property_full_address: p.full_address || prev.property_full_address,
      property_address: p.address || prev.property_address,
      property_apartment_number: p.appartment_number || prev.property_apartment_number,
      property_city: p.city || prev.property_city,
      property_state: p.state || prev.property_state,
      property_urbanization: p.urbanization_name || prev.property_urbanization,
      rental_value: p.rental_value ? formatCOP(p.rental_value) : prev.rental_value,
    }))
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
    'tenant_full_name', 'tenant_identification_number', 'tenant_identification_city',
    'guarantor_full_name', 'guarantor_identification_number', 'guarantor_identification_city',
    'owner_full_name', 'owner_identification_number', 'owner_identification_city',
    'property_full_address', 'property_city', 'property_state',
    'rental_value', 'rental_duration', 'rental_start_date',
    'contract_city', 'contract_date',
    'account_bank_name', 'account_type', 'account_number',
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

  // Save
  const handleSave = async () => {
    if (!currentFile) {
      showToast('Selecciona un contrato primero para guardar.', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(
        `${CONTRATOS_API_URL}/api/save?file=${encodeURIComponent(currentFile)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(form)),
        },
      )
      if (!res.ok) throw new Error(await res.text())
      showToast(`Cambios guardados en ${currentFile}`, 'success')
    } catch (err) {
      showToast('Error guardando: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Preview
  const handlePreview = async () => {
    setPreviewLoading(true)
    try {
      const res = await fetch(`${CONTRATOS_API_URL}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form)),
      })
      if (!res.ok) throw new Error(await res.text())
      setPreviewHtml(await res.text())
      setPreviewOpen(true)
    } catch (err) {
      showToast('Error en vista previa: ' + err.message, 'error')
    } finally {
      setPreviewLoading(false)
    }
  }

  // Generate
  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!validate()) {
      showToast('Por favor completa todos los campos obligatorios.', 'error')
      return
    }
    setGenerating(true)
    showToast('Generando contrato, por favor espera…', 'info')
    try {
      const res = await fetch(`${CONTRATOS_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form)),
      })
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)
      const contentType = res.headers.get('Content-Type') || ''
      if (contentType.includes('application/pdf')) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const disp = res.headers.get('Content-Disposition') || ''
        const match = disp.match(/filename="?([^";\n]+)"?/)
        a.download = match ? match[1] : `Contrato_${form.tenant_full_name.replace(/\s+/g, '_')}.pdf`
        a.href = url
        a.click()
        URL.revokeObjectURL(url)
        showToast('¡Contrato generado exitosamente!', 'success')
      } else {
        showToast((await res.text()) || '¡Contrato generado!', 'success')
      }
    } catch (err) {
      showToast('Error al generar el contrato: ' + err.message, 'error')
    } finally {
      setGenerating(false)
    }
  }

  // Clone
  const openCloneModal = () => {
    if (!currentFile) {
      showToast('Selecciona un contrato primero.', 'error')
      return
    }
    setCloneName('')
    setCloneOpen(true)
    setTimeout(() => cloneInputRef.current?.focus(), 50)
  }

  const confirmClone = async () => {
    if (!cloneName.trim()) return
    setCloneLoading(true)
    try {
      const res = await fetch(
        `${CONTRATOS_API_URL}/api/clone?file=${encodeURIComponent(currentFile)}&name=${encodeURIComponent(cloneName)}`,
        { method: 'POST' },
      )
      if (!res.ok) throw new Error(await res.text())
      const { file: newFile } = await res.json()
      setCloneOpen(false)
      setCloneName('')
      showToast(`Contrato clonado como "${newFile}"`, 'success')
      const cfgRes = await fetch(
        `${CONTRATOS_API_URL}/api/config?file=${encodeURIComponent(newFile)}`,
      )
      if (cfgRes.ok) {
        setForm(fillFormFromConfig(await cfgRes.json()))
        setCurrentFile(newFile)
      }
    } catch (err) {
      showToast('Error clonando: ' + err.message, 'error')
    } finally {
      setCloneLoading(false)
    }
  }

  const clonePreviewName = cloneName.trim()
    ? cloneName.endsWith('.yml') || cloneName.endsWith('.yaml')
      ? cloneName
      : cloneName + '.yml'
    : '.yml'

  const titleText = currentFile ? currentFile.replace(/\.ya?ml$/i, '') : 'Contratos de Arrendamiento'

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="contratos-page">

      {/* Header */}
      <header className="contratos-header">
        <h1>{titleText}</h1>
        <span className="subtitle">Colombia &mdash; Generador de documentos</span>
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
                <div className="c-card-icon"><IcoPerson /></div>
                <h2>Inquilino (Arrendatario)</h2>
                <p>Datos personales</p>
              </div>
              <div className="c-card-body">
                <div className="c-field full">
                  <label className="c-label">Nombre completo <span className="req">*</span></label>
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
                  <label className="c-label">Número de cédula <span className="req">*</span></label>
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
                  <label className="c-label">Ciudad de expedición <span className="req">*</span></label>
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
                <div className="c-card-icon"><IcoGroup /></div>
                <h2>Codeudor / Garante</h2>
                <p>Datos personales</p>
              </div>
              <div className="c-card-body">
                <div className="c-field full">
                  <label className="c-label">Nombre completo <span className="req">*</span></label>
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
                  <label className="c-label">Número de cédula <span className="req">*</span></label>
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
                  <label className="c-label">Ciudad de expedición <span className="req">*</span></label>
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
                <div className="c-card-icon"><IcoShield /></div>
                <h2>Propietario (Arrendador)</h2>
                <p>Datos del dueño</p>
              </div>
              <div className="c-card-body cols-1">
                <div className="c-field">
                  <label className="c-label">Nombre completo <span className="req">*</span></label>
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
                  <label className="c-label">Número de cédula <span className="req">*</span></label>
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
                  <label className="c-label">Ciudad de expedición <span className="req">*</span></label>
                  <input
                    className={inputClass('owner_identification_city')}
                    data-field="owner_identification_city"
                    type="text"
                    placeholder="Ej. Medellín"
                    value={form.owner_identification_city}
                    onChange={set('owner_identification_city')}
                  />
                </div>
              </div>
            </section>

            {/* INMUEBLE */}
            <section className="c-card" id="sec-inmueble">
              <div className="c-card-header">
                <div className="c-card-icon"><IcoHome /></div>
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
                      onChange={(e) => { setAliasQuery(e.target.value); setAliasOpen(true) }}
                      onFocus={() => setAliasOpen(true)}
                      onBlur={() => setTimeout(() => setAliasOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setAliasOpen(false)
                      }}
                    />
                    <ul className={`c-alias-dropdown${aliasOpen && filteredProperties.length > 0 ? ' open' : ''}`}>
                      {filteredProperties.map((p, i) => (
                        <li
                          key={i}
                          onMouseDown={(e) => { e.preventDefault(); selectProperty(p) }}
                        >
                          <IcoHome />
                          <div>
                            <div className="alias-name">{p.alias}</div>
                            <div className="alias-addr">
                              {p.full_address}
                              {p.appartment_number ? ` · Apto ${p.appartment_number}` : ''}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="c-field full">
                  <label className="c-label">Dirección completa <span className="req">*</span></label>
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
                  <label className="c-label">Ciudad <span className="req">*</span></label>
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
                  <label className="c-label">Departamento <span className="req">*</span></label>
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
                  <label className="c-label">Nombre urbanización / conjunto</label>
                  <input
                    className="c-input"
                    type="text"
                    placeholder="Ej. Caminos de San Patricio"
                    value={form.property_urbanization}
                    onChange={set('property_urbanization')}
                  />
                </div>
              </div>
            </section>

            {/* CONTRATO */}
            <section className="c-card" id="sec-contrato">
              <div className="c-card-header">
                <div className="c-card-icon"><IcoDoc /></div>
                <h2>Contrato de Arrendamiento</h2>
                <p>Condiciones económicas</p>
              </div>
              <div className="c-card-body cols-3">
                <div className="c-field">
                  <label className="c-label">Valor arriendo <span className="req">*</span></label>
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
                  <label className="c-label">Duración (meses) <span className="req">*</span></label>
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
                  <label className="c-label">Fecha inicio <span className="req">*</span></label>
                  <input
                    className={inputClass('rental_start_date')}
                    data-field="rental_start_date"
                    type="date"
                    value={form.rental_start_date}
                    onChange={set('rental_start_date')}
                  />
                </div>
                <div className="c-field">
                  <label className="c-label">Ciudad del contrato <span className="req">*</span></label>
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
                  <label className="c-label">Fecha del contrato <span className="req">*</span></label>
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

            {/* CUENTA */}
            <section className="c-card" id="sec-cuenta">
              <div className="c-card-header">
                <div className="c-card-icon"><IcoCard /></div>
                <h2>Cuenta Bancaria</h2>
                <p>Para pago del arriendo</p>
              </div>
              <div className="c-card-body">
                <div className="c-field">
                  <label className="c-label">Nombre del banco <span className="req">*</span></label>
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
                  <label className="c-label">Tipo de cuenta <span className="req">*</span></label>
                  <div className="c-select-wrap">
                    <select
                      className={`c-select${errors.account_type ? ' error' : ''}`}
                      data-field="account_type"
                      value={form.account_type}
                      onChange={set('account_type')}
                    >
                      <option value="">Seleccionar…</option>
                      <option value="ahorros">Cuenta de Ahorros</option>
                      <option value="corriente">Cuenta Corriente</option>
                      <option value="Nequi">Nequi</option>
                      <option value="Daviplata">Daviplata</option>
                    </select>
                  </div>
                </div>
                <div className="c-field">
                  <label className="c-label">Número de cuenta <span className="req">*</span></label>
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
                  <label className="c-label">Nombre titular</label>
                  <input
                    className="c-input"
                    type="text"
                    placeholder="Ej. Yefrin David Ríos Mora"
                    value={form.account_name}
                    onChange={set('account_name')}
                  />
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
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? <IcoSpinner /> : <IcoSave />}
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={previewLoading}
                  onClick={handlePreview}
                >
                  {previewLoading ? <IcoSpinner /> : <IcoEye />}
                  Vista previa
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
        <div className="c-overlay" onClick={(e) => e.target === e.currentTarget && setPickerOpen(false)}>
          <div className="c-picker">
            <div className="c-picker-header">
              <div className="c-card-icon" style={{ width: 40, height: 40 }}>
                <IcoDoc />
              </div>
              <div>
                <h2>¿Qué contrato vamos a ejecutar?</h2>
                {pickerDir && <p>{pickerDir}</p>}
              </div>
            </div>
            <div className="c-picker-list">
              {pickerLoading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                  Cargando…
                </div>
              ) : pickerFiles.length === 0 ? (
                <div className="c-picker-empty">
                  <p>
                    No se encontraron archivos <code>.yml</code> en el directorio configurado.
                  </p>
                </div>
              ) : (
                pickerFiles.map((file) => (
                  <div
                    key={file}
                    className="c-picker-item"
                    onClick={() => selectContract(file)}
                  >
                    <IcoDoc />
                    <span>{file}</span>
                    <span className="arrow">→</span>
                  </div>
                ))
              )}
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
                <p>Basado en: {currentFile}</p>
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
                  placeholder="Ej. nuevo_inquilino_2025"
                  autoComplete="off"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmClone()
                    if (e.key === 'Escape') { setCloneOpen(false); setCloneName('') }
                  }}
                />
                <span className="c-hint">
                  Se guardará como <code>{clonePreviewName}</code> en la misma carpeta
                </span>
              </div>
              <div className="c-clone-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setCloneOpen(false); setCloneName('') }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`btn-generate${cloneLoading ? ' loading' : ''}`}
                  style={{ padding: '10px 22px' }}
                  disabled={cloneLoading || !cloneName.trim()}
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
              <span>
                {titleText} — Vista previa
              </span>
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
