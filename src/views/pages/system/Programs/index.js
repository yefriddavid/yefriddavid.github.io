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
import {
  cilTerminal,
  cilPlus,
  cilTrash,
  cilPencil,
  cilMediaPlay,
  cilBan,
  cilInfo,
  cilChevronTop,
  cilChevronBottom,
} from '@coreui/icons'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from 'src/components/shared/Spinner'
import IconClone from 'src/components/shared/IconClone'
import { PROGRAM_HOOKS, getHookVars, PROGRAM_VAR_DESCRIPTIONS } from 'src/constants/programHooks'
import { logRequest as auditLog } from 'src/actions/system/auditLogActions'
import * as programActions from 'src/actions/system/programActions'
import './Programs.scss'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const Programs = () => {
  const dispatch = useDispatch()
  const programs = useSelector((s) => s.program.data) ?? []
  const fetching = useSelector((s) => s.program.fetching)
  const [extId, setExtId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [promptProgram, setPromptProgram] = useState(null)
  const [promptValues, setPromptValues] = useState({})
  const [varsHelpOpen, setVarsHelpOpen] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm()

  const selectedHooks = watch('hooks') ?? []
  const hookVars = getHookVars(Array.isArray(selectedHooks) ? selectedHooks : [selectedHooks])

  useEffect(() => {
    dispatch(programActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    const id = sessionStorage.getItem('__localrunner_ext_id__')
    if (id) setExtId(id)
  }, [])

  const openAdd = () => {
    reset({ name: '', binary: '', args: '', hooks: [] })
    setEditId(null)
    setFormOpen(true)
  }

  const openEdit = (p, e) => {
    e.stopPropagation()
    reset({ name: p.name, binary: p.binary, args: p.args.join(' '), hooks: p.hooks || [] })
    setEditId(p.id)
    setFormOpen(true)
  }

  const onSubmit = (data) => {
    const args = data.args.trim() ? data.args.trim().split(/\s+/) : []
    const hooks = Array.isArray(data.hooks) ? data.hooks : data.hooks ? [data.hooks] : []
    if (editId) {
      dispatch(
        programActions.updateRequest({
          id: editId,
          name: data.name,
          binary: data.binary,
          args,
          hooks,
        }),
      )
    } else {
      dispatch(programActions.createRequest({ name: data.name, binary: data.binary, args, hooks }))
    }
    setFormOpen(false)
  }

  const toggleDisabled = (p, e) => {
    e.stopPropagation()
    dispatch(programActions.updateRequest({ id: p.id, disabled: !p.disabled }))
  }

  const cloneProgram = (p, e) => {
    e.stopPropagation()
    dispatch(
      programActions.createRequest({
        name: `${p.name} (copia)`,
        binary: p.binary,
        args: p.args,
        hooks: p.hooks,
      }),
    )
  }

  const deleteProgram = (id, name, e) => {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminar el programa "${name}"?`)) return
    dispatch(programActions.deleteRequest({ id }))
    if (selected?.id === id) {
      setSelected(null)
      setOutput(null)
    }
  }

  const execProgram = useCallback(
    (program, resolvedArgs) => {
      setSelected(program)
      setRunning(true)
      setOutput(null)

      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(
        extId,
        { binary: program.binary, args: resolvedArgs },
        (response) => {
          setRunning(false)
          // eslint-disable-next-line no-undef
          const runtimeErr = chrome.runtime.lastError?.message
          const result = runtimeErr ? { error: runtimeErr } : response
          setOutput(result)

          dispatch(
            auditLog({
              operation: 'RUN',
              entity: 'program',
              program: program.name,
              binary: program.binary,
              exitCode: response?.exitCode ?? null,
              stdout: response?.stdout ?? null,
              stderr: response?.stderr ?? null,
              error: runtimeErr ?? response?.error ?? null,
            }),
          )
        },
      )
    },
    [extId, dispatch],
  )

  const run = useCallback(
    (program) => {
      if (!extId || running) return
      const vars = [
        ...new Set(
          program.args.flatMap((a) => (a.match(/\{\{(\w+)\}\}/g) ?? []).map((m) => m.slice(2, -2))),
        ),
      ]
      if (vars.length > 0) {
        setPromptValues(Object.fromEntries(vars.map((v) => [v, ''])))
        setPromptProgram(program)
      } else {
        execProgram(program, program.args)
      }
    },
    [extId, running, execProgram],
  )

  const runFromPrompt = () => {
    const resolved = promptProgram.args.map((a) =>
      a.replace(/\{\{(\w+)\}\}/g, (_, k) => promptValues[k] ?? ''),
    )
    setPromptProgram(null)
    execProgram(promptProgram, resolved)
  }

  const exitColor = output?.error || output?.exitCode !== 0 ? 'danger' : 'success'

  return (
    <div className="lp-page">
      {!extId && (
        <div className="lp-banner">
          <strong>Extensión no detectada.</strong> Instala la extensión desde{' '}
          <code>extension/</code> en <code>chrome://extensions</code> y recarga la página.
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
            {fetching && programs.length === 0 && <Spinner mode="section" />}
            {!fetching && programs.length === 0 && (
              <p className="lp-empty">No hay programas configurados.</p>
            )}
            {programs.map((p) => (
              <div
                key={p.id}
                className={`lp-item${selected?.id === p.id ? ' lp-item--active' : ''}`}
              >
                <div className="lp-item__info" onClick={() => run(p)}>
                  <CIcon icon={cilTerminal} className="lp-item__icon" />
                  <div className="lp-item__text">
                    <div className="lp-item__name">{p.name}</div>
                    <div className="lp-item__path">{p.binary}</div>
                    {p.hooks?.length > 0 && (
                      <div className="lp-item__hooks">
                        {p.hooks.map((h) => (
                          <span
                            key={h}
                            className={`lp-item__hook${p.disabled ? ' lp-item__hook--off' : ''}`}
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="lp-item__actions">
                  <CButton
                    size="sm"
                    color={p.disabled ? 'warning' : 'secondary'}
                    variant="ghost"
                    title={
                      p.disabled
                        ? 'Hooks deshabilitados (clic para habilitar)'
                        : 'Deshabilitar hooks'
                    }
                    onClick={(e) => toggleDisabled(p, e)}
                  >
                    <CIcon icon={cilBan} />
                  </CButton>
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
                  <CButton
                    size="sm"
                    color="info"
                    variant="ghost"
                    title="Clonar"
                    onClick={(e) => cloneProgram(p, e)}
                  >
                    <IconClone />
                  </CButton>
                  <CButton
                    size="sm"
                    color="primary"
                    variant="ghost"
                    title="Editar"
                    onClick={(e) => openEdit(p, e)}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton
                    size="sm"
                    color="danger"
                    variant="ghost"
                    title="Eliminar"
                    onClick={(e) => deleteProgram(p.id, p.name, e)}
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
            {output && (
              <CBadge color={exitColor}>Exit {output.error ? 'ERR' : output.exitCode}</CBadge>
            )}
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
                {output.stderr && (
                  <pre className="lp-output lp-output--stderr">{output.stderr}</pre>
                )}
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
            {hookVars.length > 0 && (
              <div className="lp-vars-hint">
                <span className="lp-vars-hint__label">Variables disponibles:</span>
                <button
                  type="button"
                  className="lp-vars-hint__help"
                  title="¿Qué significa cada variable?"
                  onClick={() => setVarsHelpOpen(true)}
                >
                  <CIcon icon={cilInfo} size="sm" />
                </button>
                {hookVars.map((v) => (
                  <code key={v} className="lp-vars-hint__token">{`{{${v}}}`}</code>
                ))}
              </div>
            )}
          </div>
          <div className="mb-3">
            <CFormLabel>Hooks (Ctrl+clic para seleccionar varios)</CFormLabel>
            <select multiple className="lp-hooks-select" {...register('hooks')}>
              {PROGRAM_HOOKS.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label}
                </option>
              ))}
            </select>
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

      <CModal visible={!!promptProgram} onClose={() => setPromptProgram(null)}>
        <CModalHeader>
          <CModalTitle>Argumentos — {promptProgram?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {Object.keys(promptValues).map((v) => (
            <div key={v} className="mb-3">
              <CFormLabel>
                <code>{`{{${v}}}`}</code>
              </CFormLabel>
              <CFormInput
                value={promptValues[v]}
                onChange={(e) => setPromptValues((prev) => ({ ...prev, [v]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && runFromPrompt()}
                autoFocus={Object.keys(promptValues)[0] === v}
              />
            </div>
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPromptProgram(null)}>
            Cancelar
          </CButton>
          <CButton color="success" onClick={runFromPrompt}>
            Ejecutar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={varsHelpOpen} onClose={() => setVarsHelpOpen(false)}>
        <CModalHeader>
          <CModalTitle>¿Qué significa cada variable?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <table className="lp-vars-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Significado</th>
              </tr>
            </thead>
            <tbody>
              {hookVars.map((v) => (
                <tr key={v}>
                  <td>
                    <code>{`{{${v}}}`}</code>
                  </td>
                  <td>{PROGRAM_VAR_DESCRIPTIONS[v] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVarsHelpOpen(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      <CCard className="lp-install-card">
        <CCardHeader
          className="lp-install-card__header"
          onClick={() => setInstallOpen((v) => !v)}
        >
          <span>Cómo instalar la extensión</span>
          <CIcon icon={installOpen ? cilChevronTop : cilChevronBottom} />
        </CCardHeader>
        {installOpen && (
          <CCardBody className="lp-install-card__body">
            <ol className="lp-install-steps">
              <li>
                Abre <code>chrome://extensions/</code> y activa{' '}
                <strong>Modo de desarrollador</strong> (arriba a la derecha).
              </li>
              <li>
                Clic en <strong>Cargar sin empaquetar</strong> → selecciona la carpeta{' '}
                <code>extension/</code> del proyecto.
              </li>
              <li>
                Copia el <strong>ID</strong> que aparece bajo el nombre de la extensión.
              </li>
              <li>
                En una terminal, desde la raíz del proyecto:
                <pre className="lp-install-steps__code">
                  cd extension/native-host{'\n'}
                  ./install.sh &lt;EXTENSION_ID&gt;
                </pre>
              </li>
              <li>
                En <code>chrome://extensions/</code> recarga la extensión (ícono 🔄) y luego
                recarga esta página (<code>Ctrl+R</code>). El banner de "Extensión no detectada"
                debe desaparecer.
              </li>
            </ol>
            <p className="lp-install-note">
              Si quitas y vuelves a cargar la extensión el ID cambia — hay que repetir el paso 4
              con el nuevo ID. Error "Access to the specified native messaging host is forbidden"
              = mismo problema, mismo fix.
            </p>
          </CCardBody>
        )}
      </CCard>
    </div>
  )
}

export default Programs
