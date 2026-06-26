import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTerminal, cilPlus, cilTrash, cilPencil, cilMediaPlay } from '@coreui/icons'
import { useForm } from 'react-hook-form'
import Spinner from 'src/components/shared/Spinner'
import './Programs.scss'

const STORAGE_KEY = 'localrunner_programs'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const loadPrograms = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const Programs = () => {
  const [programs, setPrograms] = useState(loadPrograms)
  const [extId, setExtId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    const id = sessionStorage.getItem('__localrunner_ext_id__')
    if (id) setExtId(id)
  }, [])

  const persist = (next) => {
    setPrograms(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const openAdd = () => {
    reset({ name: '', binary: '', args: '' })
    setEditId(null)
    setFormOpen(true)
  }

  const openEdit = (p, e) => {
    e.stopPropagation()
    reset({ name: p.name, binary: p.binary, args: p.args.join(' ') })
    setEditId(p.id)
    setFormOpen(true)
  }

  const onSubmit = (data) => {
    const args = data.args.trim() ? data.args.trim().split(/\s+/) : []
    if (editId) {
      persist(programs.map((p) => (p.id === editId ? { ...p, name: data.name, binary: data.binary, args } : p)))
    } else {
      persist([...programs, { id: Date.now().toString(), name: data.name, binary: data.binary, args }])
    }
    setFormOpen(false)
  }

  const deleteProgram = (id, e) => {
    e.stopPropagation()
    persist(programs.filter((p) => p.id !== id))
    if (selected?.id === id) {
      setSelected(null)
      setOutput(null)
    }
  }

  const run = useCallback(
    (program) => {
      if (!extId || running) return
      setSelected(program)
      setRunning(true)
      setOutput(null)

      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(extId, { binary: program.binary, args: program.args }, (response) => {
        setRunning(false)
        // eslint-disable-next-line no-undef
        if (chrome.runtime.lastError) {
          // eslint-disable-next-line no-undef
          setOutput({ error: chrome.runtime.lastError.message })
        } else {
          setOutput(response)
        }
      })
    },
    [extId, running],
  )

  const exitColor = output?.error || output?.exitCode !== 0 ? 'danger' : 'success'

  return (
    <div className="lp-page">
      {!extId && (
        <div className="lp-banner">
          <strong>Extensión no detectada.</strong> Instala la extensión desde <code>extension/</code> en{' '}
          <code>chrome://extensions</code> y recarga la página.
        </div>
      )}

      <div className="lp-layout">
        <CCard className="lp-list-card">
          <CCardHeader className="lp-list-card__header">
            <span>Programas</span>
            <CButton size="sm" color="primary" onClick={openAdd}>
              <CIcon icon={cilPlus} className="me-1" />
              Agregar
            </CButton>
          </CCardHeader>
          <CCardBody className="lp-list-card__body">
            {programs.length === 0 && <p className="lp-empty">No hay programas configurados.</p>}
            {programs.map((p) => (
              <div key={p.id} className={`lp-item${selected?.id === p.id ? ' lp-item--active' : ''}`}>
                <div className="lp-item__info" onClick={() => run(p)}>
                  <CIcon icon={cilTerminal} className="lp-item__icon" />
                  <div className="lp-item__text">
                    <div className="lp-item__name">{p.name}</div>
                    <div className="lp-item__path">{p.binary}</div>
                  </div>
                </div>
                <div className="lp-item__actions">
                  <CButton
                    size="sm"
                    color="success"
                    variant="ghost"
                    title="Ejecutar"
                    disabled={!extId || running}
                    onClick={() => run(p)}
                  >
                    <CIcon icon={cilMediaPlay} />
                  </CButton>
                  <CButton size="sm" color="primary" variant="ghost" title="Editar" onClick={(e) => openEdit(p, e)}>
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton
                    size="sm"
                    color="danger"
                    variant="ghost"
                    title="Eliminar"
                    onClick={(e) => deleteProgram(p.id, e)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </div>
            ))}
          </CCardBody>
        </CCard>

        <CCard className="lp-output-card">
          <CCardHeader className="lp-output-card__header">
            <span className="lp-output-card__title">
              Output{selected ? ` — ${selected.name}` : ''}
            </span>
            {output && <CBadge color={exitColor}>Exit {output.error ? 'ERR' : output.exitCode}</CBadge>}
          </CCardHeader>
          <CCardBody className="lp-output-card__body">
            {running && (
              <div className="lp-output-card__running">
                <Spinner size="sm" /> Ejecutando...
              </div>
            )}
            {!running && !output && (
              <p className="lp-empty">Selecciona un programa y presiona ▶ para ejecutarlo.</p>
            )}
            {!running && output?.error && (
              <pre className="lp-output lp-output--error">{output.error}</pre>
            )}
            {!running && output && !output.error && (
              <>
                {output.stdout && <pre className="lp-output">{output.stdout}</pre>}
                {output.stderr && <pre className="lp-output lp-output--stderr">{output.stderr}</pre>}
                {!output.stdout && !output.stderr && <p className="lp-empty">(sin output)</p>}
              </>
            )}
          </CCardBody>
        </CCard>
      </div>

      <CModal visible={formOpen} onClose={() => setFormOpen(false)}>
        <CModalHeader>
          <CModalTitle>{editId ? 'Editar programa' : 'Agregar programa'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              placeholder="Mi programa"
              invalid={!!errors.name}
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            {fieldError(errors.name)}
          </div>
          <div className="mb-3">
            <CFormLabel>Ruta del binario</CFormLabel>
            <CFormInput
              placeholder="/home/user/bin/miprograma"
              invalid={!!errors.binary}
              {...register('binary', { required: 'La ruta del binario es obligatoria' })}
            />
            {fieldError(errors.binary)}
          </div>
          <div className="mb-3">
            <CFormLabel>Argumentos (separados por espacios)</CFormLabel>
            <CFormInput placeholder="--flag valor" {...register('args')} />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setFormOpen(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSubmit(onSubmit)}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Programs
