import React from 'react'
import { CLink } from '@coreui/react'
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
} from './icons'
import NotesSection from './NotesSection'
import AttachmentsSection from './AttachmentsSection'
import ContractPickerModal from './ContractPickerModal'
import NameModal from './NameModal'
import { useGenerarContrato } from './useGenerarContrato'
import '../GenerarContrato.scss'

export default function GenerarContrato() {
  const {
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
    form,
    errors,
    set,
    setRentalValue,
    inputClass,
    currentContract,
    setCurrentContract,
    toast,
    titleText,
    pickerOpen,
    setPickerOpen,
    newOpen,
    setNewOpen,
    cloneOpen,
    setCloneOpen,
    handlePickerSelect,
    handleCloneOpen,
    ownerQuery,
    setOwnerQuery,
    ownerOpen,
    setOwnerOpen,
    filteredOwners,
    selectOwner,
    saveOwner,
    deleteOwnerItem,
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
    accountQuery,
    setAccountQuery,
    accountOpen,
    setAccountOpen,
    filteredBankAccounts,
    selectBankAccount,
    saveBankAccount,
    deleteBankAccountItem,
    validate,
    handleSave,
    handleCreate,
    handleClone,
    handleAttachFiles,
    activeSection,
    templates,
    generatingTemplate,
    templatePreviewOpen,
    setTemplatePreviewOpen,
    templatePreviewHtml,
    templatePreviewTitle,
    handleTemplatePreview,
    handleTemplateGenerate,
  } = useGenerarContrato()

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
        <button className="c-btn-header" onClick={handleCloneOpen}>
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
          <form className="contratos-form" onSubmit={(e) => e.preventDefault()} noValidate>
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
              <p>Guarda los cambios antes de generar. El PDF se descargará automáticamente.</p>
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
          onConfirm={handleCreate}
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
          onConfirm={handleClone}
          onCancel={() => setCloneOpen(false)}
        />
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
