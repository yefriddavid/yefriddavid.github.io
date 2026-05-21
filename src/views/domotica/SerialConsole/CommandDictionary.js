import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Column,
  FilterRow,
  SearchPanel,
  GroupPanel,
  Grouping,
  MasterDetail,
  Paging,
  Pager,
  HeaderFilter,
  Toolbar,
  Item,
} from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { CButton, CToast, CToastBody, CToaster } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilPlus, cilTrash, cilPencil, cilCheck, cilCloudDownload } from '@coreui/icons'
import SKYPATROL_COMMANDS from './skypatrolCommands'
import { DOMOTICA_SERIAL_CATEGORIES as CATEGORIES } from 'src/constants/domotica'
import * as actions from 'src/actions/domotica/domoticaCommandDictionaryActions'
import CommandProfilesPanel from './CommandProfilesPanel'
import { push as pushNotification } from 'src/reducers/notificationsSlice'
import './CommandDictionary.scss'
import Spinner from 'src/components/shared/Spinner'

const EMPTY_CMD = {
  category: 'Personalizado',
  command: '',
  name: '',
  description: '',
  queryFormat: 'N/A',
  readFormat: 'N/A',
  writeFormat: 'N/A',
  params: '',
  notes: '',
}

const DetailPanel = ({ data }) => {
  const row = data.data
  return (
    <div className="cmd-detail">
      {row.description && <p className="cmd-detail__desc">{row.description}</p>}
      <div className="cmd-detail__grid">
        {row.queryFormat && row.queryFormat !== 'N/A' && (
          <div className="cmd-detail__item">
            <span className="cmd-detail__label">Query Format</span>
            <code className="cmd-detail__code">{row.queryFormat}</code>
          </div>
        )}
        {row.readFormat && row.readFormat !== 'N/A' && (
          <div className="cmd-detail__item">
            <span className="cmd-detail__label">Read Format</span>
            <code className="cmd-detail__code">{row.readFormat}</code>
          </div>
        )}
        {row.writeFormat && row.writeFormat !== 'N/A' && (
          <div className="cmd-detail__item">
            <span className="cmd-detail__label">Write Format</span>
            <code className="cmd-detail__code">{row.writeFormat}</code>
          </div>
        )}
        {row.params && row.params !== 'N/A' && (
          <div className="cmd-detail__item cmd-detail__item--full">
            <span className="cmd-detail__label">Parámetros</span>
            <span className="cmd-detail__text">{row.params}</span>
          </div>
        )}
        {row.notes && row.notes !== 'N/A' && (
          <div className="cmd-detail__item cmd-detail__item--full">
            <span className="cmd-detail__label">Notas</span>
            <span className="cmd-detail__text">{row.notes}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const CommandDictionary = () => {
  const dispatch = useDispatch()
  const { data, fetching, saving, seeding } = useSelector((s) => s.domoticaCommandDictionary)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_CMD)
  const [toasts, setToasts] = useState([])
  const toastTimersRef = useRef([])

  useEffect(() => {
    dispatch(actions.fetchRequest())
    return () => toastTimersRef.current.forEach(clearTimeout)
  }, [dispatch])

  const prevSaving = useRef(saving)
  useEffect(() => {
    if (prevSaving.current && !saving && showForm) setShowForm(false)
    prevSaving.current = saving
  }, [saving, showForm])

  const toast = useCallback((msg) => {
    const id = Date.now()
    setToasts((p) => [...p, { id, msg }])
    const timerId = setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2500)
    toastTimersRef.current.push(timerId)
  }, [])

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(`Copiado: ${text}`)
    } catch {
      toast('No se pudo copiar')
    }
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...EMPTY_CMD })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setForm({ ...row })
    setShowForm(true)
  }

  const saveForm = () => {
    if (!form.command.trim() || !form.name.trim()) return
    if (editingId) {
      dispatch(actions.updateRequest({ ...form, id: editingId }))
      toast('Comando actualizado')
      dispatch(pushNotification({ type: 'success', message: 'Comando actualizado.' }))
    } else {
      dispatch(actions.createRequest(form))
      toast('Comando agregado')
      dispatch(pushNotification({ type: 'success', message: 'Comando agregado.' }))
    }
  }

  const deleteCmd = (id) => {
    dispatch(actions.deleteRequest({ id }))
  }

  const seedFromSkypatrol = () => {
    dispatch(actions.seedRequest(SKYPATROL_COMMANDS))
    toast('Importando comandos Skypatrol…')
  }

  const actionsCell = ({ data: row }) => (
    <div className="cmd-actions">
      <button
        className="cmd-actions__btn cmd-actions__btn--copy"
        title="Copiar comando"
        onClick={() =>
          copyToClipboard(
            row.writeFormat !== 'N/A' ? row.writeFormat : row.readFormat || row.queryFormat,
          )
        }
      >
        <CIcon icon={cilCopy} size="sm" />
      </button>
      <button
        className="cmd-actions__btn cmd-actions__btn--edit"
        title="Editar"
        onClick={() => openEdit(row)}
      >
        <CIcon icon={cilPencil} size="sm" />
      </button>
      <button
        className="cmd-actions__btn cmd-actions__btn--del"
        title="Eliminar"
        onClick={() => deleteCmd(row.id)}
      >
        <CIcon icon={cilTrash} size="sm" />
      </button>
    </div>
  )

  const categoryCell = ({ value }) => (
    <span className={`cmd-cat cmd-cat--${value?.toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>
  )

  const commandCell = ({ value }) => <code className="cmd-code">{value}</code>

  if (fetching && !data) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner color="primary" />
      </div>
    )
  }

  return (
    <div className="cmd-page">
      <div className="cmd-dict">
        <CToaster placement="top-end">
          {toasts.map((t) => (
            <CToast key={t.id} visible autohide={false} className="cmd-toast">
              <CToastBody className="d-flex align-items-center gap-2">
                <CIcon icon={cilCheck} size="sm" className="text-success" />
                {t.msg}
              </CToastBody>
            </CToast>
          ))}
        </CToaster>

        {showForm && (
          <div className="cmd-form-overlay">
            <div className="cmd-form">
              <div className="cmd-form__header">
                <h5>{editingId ? 'Editar Comando' : 'Nuevo Comando'}</h5>
                <button className="cmd-form__close" onClick={() => setShowForm(false)}>
                  ✕
                </button>
              </div>
              <div className="cmd-form__body">
                <div className="cmd-form__row">
                  <label>Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cmd-form__row">
                  <label>Comando *</label>
                  <input
                    placeholder="AT+CGDCONT"
                    value={form.command}
                    onChange={(e) => setForm((p) => ({ ...p, command: e.target.value }))}
                  />
                </div>
                <div className="cmd-form__row">
                  <label>Nombre *</label>
                  <input
                    placeholder="Configurar APN"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="cmd-form__row">
                  <label>Descripción</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="cmd-form__row">
                  <label>Query Format</label>
                  <input
                    value={form.queryFormat}
                    onChange={(e) => setForm((p) => ({ ...p, queryFormat: e.target.value }))}
                  />
                </div>
                <div className="cmd-form__row">
                  <label>Read Format</label>
                  <input
                    value={form.readFormat}
                    onChange={(e) => setForm((p) => ({ ...p, readFormat: e.target.value }))}
                  />
                </div>
                <div className="cmd-form__row">
                  <label>Write Format</label>
                  <input
                    value={form.writeFormat}
                    onChange={(e) => setForm((p) => ({ ...p, writeFormat: e.target.value }))}
                  />
                </div>
                <div className="cmd-form__row">
                  <label>Parámetros</label>
                  <textarea
                    rows={2}
                    value={form.params}
                    onChange={(e) => setForm((p) => ({ ...p, params: e.target.value }))}
                  />
                </div>
                <div className="cmd-form__row">
                  <label>Notas</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="cmd-form__footer">
                <button
                  className="cmd-form__btn cmd-form__btn--cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="cmd-form__btn cmd-form__btn--save"
                  onClick={saveForm}
                  disabled={saving || !form.command.trim() || !form.name.trim()}
                >
                  {saving ? <Spinner size="sm" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <StandardGrid
          dataSource={data ?? []}
          keyExpr="id"
          showBorders={false}
          wordWrapEnabled={false}
          className="cmd-dict__grid"
        >
          <SearchPanel visible placeholder="Buscar comando…" />
          <FilterRow visible />
          <HeaderFilter visible />
          <GroupPanel visible emptyPanelText="Arrastra una columna aquí para agrupar" />
          <Grouping autoExpandAll={false} />
          <Paging defaultPageSize={20} />
          <Pager showPageSizeSelector allowedPageSizes={[10, 20, 50]} showInfo />

          <Toolbar>
            <Item name="groupPanel" />
            <Item name="searchPanel" />
            <Item location="after">
              <CButton size="sm" color="primary" onClick={openAdd} disabled={saving}>
                <CIcon icon={cilPlus} size="sm" className="me-1" />
                Agregar
              </CButton>
            </Item>
            <Item location="after">
              <CButton
                size="sm"
                color="secondary"
                variant="outline"
                onClick={seedFromSkypatrol}
                disabled={seeding}
                title="Importa todos los comandos Skypatrol TT8750 a Firebase"
              >
                {seeding ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <CIcon icon={cilCloudDownload} size="sm" className="me-1" />
                )}
                Seed Skypatrol
              </CButton>
            </Item>
          </Toolbar>

          <Column
            dataField="category"
            caption="Categoría"
            width={130}
            cellRender={categoryCell}
            groupIndex={0}
          />
          <Column dataField="command" caption="Comando" width={180} cellRender={commandCell} />
          <Column dataField="name" caption="Nombre" width={200} />
          <Column
            dataField="writeFormat"
            caption="Write Format"
            width={260}
            cellRender={({ value }) =>
              value && value !== 'N/A' ? (
                <code className="cmd-code cmd-code--sm">{value}</code>
              ) : (
                <span className="cmd-na">—</span>
              )
            }
          />
          <Column
            dataField="readFormat"
            caption="Read Format"
            width={200}
            cellRender={({ value }) =>
              value && value !== 'N/A' ? (
                <code className="cmd-code cmd-code--sm">{value}</code>
              ) : (
                <span className="cmd-na">—</span>
              )
            }
          />
          <Column
            caption=""
            width={100}
            allowSorting={false}
            allowFiltering={false}
            allowGrouping={false}
            cellRender={actionsCell}
            fixed
            fixedPosition="right"
          />

          <MasterDetail enabled component={DetailPanel} />
        </StandardGrid>
      </div>
      <CommandProfilesPanel />
    </div>
  )
}

export default CommandDictionary
