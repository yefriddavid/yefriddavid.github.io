import React, { useState, useCallback } from 'react'
import DataGrid, {
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
  Export,
} from 'devextreme-react/data-grid'
import { CButton, CToast, CToastBody, CToaster } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilPlus, cilTrash, cilPencil, cilCheck } from '@coreui/icons'
import SKYPATROL_COMMANDS from './skypatrolCommands'
import './CommandDictionary.scss'

const STORAGE_KEY = 'domotica_command_dictionary'

const loadCommands = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : SKYPATROL_COMMANDS
  } catch {
    return SKYPATROL_COMMANDS
  }
}

const saveCommands = (commands) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(commands))
}

const CATEGORIES = [
  'GPS',
  'Misceláneos',
  'Mensajes',
  'Red',
  'IP Router',
  'Reloj RTC',
  'Audio',
  'GPIO',
  'Macros',
  'Funciones',
  'Buzzer',
  'Movimiento',
  'FOTA',
  'PAD',
  'API TCP',
  'Personalizado',
]

const EMPTY_CMD = {
  id: null,
  category: 'Personalizado',
  command: '',
  name: '',
  description: '',
  queryFormat: '',
  readFormat: '',
  writeFormat: '',
  params: '',
  notes: '',
}

let nextCustomId = 1000

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
  const [commands, setCommands] = useState(loadCommands)
  const [showForm, setShowForm] = useState(false)
  const [editingCmd, setEditingCmd] = useState(null)
  const [form, setForm] = useState(EMPTY_CMD)
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg) => {
    const id = Date.now()
    setToasts((p) => [...p, { id, msg }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2500)
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
    setEditingCmd(null)
    setForm({ ...EMPTY_CMD, id: nextCustomId++ })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditingCmd(row.id)
    setForm({ ...row })
    setShowForm(true)
  }

  const deleteCmd = (id) => {
    const updated = commands.filter((c) => c.id !== id)
    setCommands(updated)
    saveCommands(updated)
  }

  const saveForm = () => {
    if (!form.command.trim() || !form.name.trim()) return
    let updated
    if (editingCmd !== null) {
      updated = commands.map((c) => (c.id === editingCmd ? { ...form } : c))
    } else {
      updated = [...commands, { ...form }]
    }
    setCommands(updated)
    saveCommands(updated)
    setShowForm(false)
    toast(editingCmd !== null ? 'Comando actualizado' : 'Comando agregado')
  }

  const resetToDefault = () => {
    setCommands(SKYPATROL_COMMANDS)
    saveCommands(SKYPATROL_COMMANDS)
    toast('Diccionario restaurado')
  }

  const actionsCell = ({ data }) => (
    <div className="cmd-actions">
      <button
        className="cmd-actions__btn cmd-actions__btn--copy"
        title="Copiar comando"
        onClick={() =>
          copyToClipboard(
            data.writeFormat !== 'N/A' ? data.writeFormat : data.readFormat || data.queryFormat,
          )
        }
      >
        <CIcon icon={cilCopy} size="sm" />
      </button>
      <button
        className="cmd-actions__btn cmd-actions__btn--edit"
        title="Editar"
        onClick={() => openEdit(data)}
      >
        <CIcon icon={cilPencil} size="sm" />
      </button>
      <button
        className="cmd-actions__btn cmd-actions__btn--del"
        title="Eliminar"
        onClick={() => deleteCmd(data.id)}
      >
        <CIcon icon={cilTrash} size="sm" />
      </button>
    </div>
  )

  const categoryCell = ({ value }) => (
    <span className={`cmd-cat cmd-cat--${value?.toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>
  )

  const commandCell = ({ value }) => <code className="cmd-code">{value}</code>

  return (
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

      {/* ── Form ── */}
      {showForm && (
        <div className="cmd-form-overlay">
          <div className="cmd-form">
            <div className="cmd-form__header">
              <h5>{editingCmd !== null ? 'Editar Comando' : 'Nuevo Comando'}</h5>
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
                  placeholder="AT$TTGPSTT"
                  value={form.command}
                  onChange={(e) => setForm((p) => ({ ...p, command: e.target.value }))}
                />
              </div>
              <div className="cmd-form__row">
                <label>Nombre *</label>
                <input
                  placeholder="GPS Status"
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
                  placeholder="AT$TTGPSTT=?"
                  value={form.queryFormat}
                  onChange={(e) => setForm((p) => ({ ...p, queryFormat: e.target.value }))}
                />
              </div>
              <div className="cmd-form__row">
                <label>Read Format</label>
                <input
                  placeholder="AT$TTGPSTT?"
                  value={form.readFormat}
                  onChange={(e) => setForm((p) => ({ ...p, readFormat: e.target.value }))}
                />
              </div>
              <div className="cmd-form__row">
                <label>Write Format</label>
                <input
                  placeholder="AT$TTGPSTT=<cmd>"
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
                disabled={!form.command.trim() || !form.name.trim()}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <DataGrid
        dataSource={commands}
        keyExpr="id"
        showBorders={false}
        rowAlternationEnabled
        allowColumnResizing
        columnAutoWidth
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
            <CButton size="sm" color="primary" onClick={openAdd}>
              <CIcon icon={cilPlus} size="sm" className="me-1" />
              Agregar
            </CButton>
          </Item>
          <Item location="after">
            <CButton size="sm" color="secondary" variant="outline" onClick={resetToDefault}>
              Restaurar Skypatrol
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
      </DataGrid>
    </div>
  )
}

export default CommandDictionary
