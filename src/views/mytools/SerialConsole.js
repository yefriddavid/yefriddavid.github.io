import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Column, FilterRow, SearchPanel, GroupPanel, Grouping,
  MasterDetail, Paging, Pager, HeaderFilter,
} from 'devextreme-react/data-grid'
import StandardGrid from '../../components/shared/StandardGrid/Index'
import CIcon from '@coreui/icons-react'
import {
  cilLink, cilLinkBroken, cilSend, cilTrash, cilPlus,
  cilX, cilReload, cilBook,
} from '@coreui/icons'
import { CSpinner } from '@coreui/react'
import AppModal from '../../components/shared/AppModal'
import SKYPATROL_COMMANDS from './skypatrolCommands'
import './SerialConsole.scss'

const BAUD_RATES = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]

const LINE_ENDINGS = [
  { label: 'CR+LF', value: '\r\n' },
  { label: 'LF',    value: '\n' },
  { label: 'CR',    value: '\r' },
  { label: 'None',  value: '' },
]

const INITIAL_COMMANDS = [
  { id: 1, label: 'GPS Status',    command: 'AT$TTGPSTT?' },
  { id: 2, label: 'GPS Query',     command: 'AT$TTGPSQRY=1F,1' },
  { id: 3, label: 'Serial Nro',    command: 'AT$TTSRN?' },
  { id: 4, label: 'ICCID',         command: 'AT$TTICCID?' },
  { id: 5, label: 'Device ID',     command: 'AT$TTDEVID?' },
  { id: 6, label: 'Odómetro',      command: 'AT$TTODOM?' },
  { id: 7, label: 'Reportar Pos.', command: 'AT$TTRN' },
  { id: 8, label: 'Red IP/DNS',    command: 'AT$TTNETIP?' },
  { id: 9, label: 'Reset',         command: 'AT$RESET' },
]

let nextId = INITIAL_COMMANDS.length + 1

const hasParams = (str) => str && str !== 'N/A' && str.includes('<')

const bestExecutable = (cmd) => {
  if (cmd.readFormat && cmd.readFormat !== 'N/A') return cmd.readFormat
  if (cmd.queryFormat && cmd.queryFormat !== 'N/A') return cmd.queryFormat
  return cmd.command
}

const DictDetail = ({ data }) => {
  const r = data.data
  return (
    <div className="sc-dict-detail">
      {r.description && <p className="sc-dict-detail__desc">{r.description}</p>}
      <div className="sc-dict-detail__grid">
        {r.queryFormat && r.queryFormat !== 'N/A' && (
          <div className="sc-dict-detail__item">
            <span className="sc-dict-detail__lbl">Query Format</span>
            <code>{r.queryFormat}</code>
          </div>
        )}
        {r.readFormat && r.readFormat !== 'N/A' && (
          <div className="sc-dict-detail__item">
            <span className="sc-dict-detail__lbl">Read Format</span>
            <code>{r.readFormat}</code>
          </div>
        )}
        {r.writeFormat && r.writeFormat !== 'N/A' && (
          <div className="sc-dict-detail__item">
            <span className="sc-dict-detail__lbl">Write Format</span>
            <code>{r.writeFormat}</code>
          </div>
        )}
        {r.params && r.params !== 'N/A' && (
          <div className="sc-dict-detail__item sc-dict-detail__item--full">
            <span className="sc-dict-detail__lbl">Parámetros</span>
            <span>{r.params}</span>
          </div>
        )}
        {r.notes && r.notes !== 'N/A' && (
          <div className="sc-dict-detail__item sc-dict-detail__item--full">
            <span className="sc-dict-detail__lbl">Notas</span>
            <span>{r.notes}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const SerialConsole = () => {
  const [isSupported] = useState(() => 'serial' in navigator)
  const [ports, setPorts] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [baudRate, setBaudRate] = useState(9600)
  const [lineEnding, setLineEnding] = useState('\r\n')
  const [log, setLog] = useState([])
  const [input, setInput] = useState('')
  const [commands, setCommands] = useState(INITIAL_COMMANDS)
  const [newLabel, setNewLabel] = useState('')
  const [newCommand, setNewCommand] = useState('')
  const [showAddCmd, setShowAddCmd] = useState(false)
  const [showDict, setShowDict] = useState(false)

  const portRef = useRef(null)
  const readerRef = useRef(null)
  const logEndRef = useRef(null)
  const inputRef = useRef(null)

  const addLog = useCallback((type, text) => {
    const time = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    setLog(prev => [...prev, { id: Date.now() + Math.random(), type, text, time }])
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const loadPorts = useCallback(async () => {
    if (!('serial' in navigator)) return
    const available = await navigator.serial.getPorts()
    setPorts(available)
  }, [])

  useEffect(() => {
    loadPorts()
    if ('serial' in navigator) {
      navigator.serial.addEventListener('connect', loadPorts)
      navigator.serial.addEventListener('disconnect', loadPorts)
      return () => {
        navigator.serial.removeEventListener('connect', loadPorts)
        navigator.serial.removeEventListener('disconnect', loadPorts)
      }
    }
  }, [loadPorts])

  const requestPort = async () => {
    try {
      await navigator.serial.requestPort()
      const updated = await navigator.serial.getPorts()
      setPorts(updated)
      setSelectedIndex(updated.length - 1)
    } catch (err) {
      if (err.name !== 'NotFoundError') addLog('error', `Error al agregar puerto: ${err.message}`)
    }
  }

  const startReading = async (port) => {
    const decoder = new TextDecoder()
    while (port.readable) {
      const reader = port.readable.getReader()
      readerRef.current = reader
      let keepGoing = true
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) { keepGoing = false; break }
          addLog('rx', decoder.decode(value))
        }
      } catch (err) {
        keepGoing = false
        if (err.name !== 'AbortError') {
          addLog('error', `Conexión interrumpida: ${err.message}`)
          setIsConnected(false)
        }
      } finally {
        reader.releaseLock()
      }
      if (!keepGoing) break
    }
  }

  const connect = async () => {
    const port = ports[selectedIndex]
    if (!port) { addLog('error', 'Selecciona un puerto primero.'); return }
    setIsConnecting(true)
    try {
      await port.open({ baudRate })
      portRef.current = port
      setIsConnected(true)
      addLog('info', `Conectado a Puerto ${selectedIndex + 1} — ${baudRate} baud`)
      startReading(port)
    } catch (err) {
      addLog('error', `Error al conectar: ${err.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      await readerRef.current?.cancel()
      await portRef.current?.close()
    } catch {
      // ignore cleanup errors
    } finally {
      portRef.current = null
      readerRef.current = null
      setIsConnected(false)
      addLog('info', 'Desconectado')
    }
  }

  const sendText = useCallback(async (text) => {
    if (!isConnected || !portRef.current?.writable) {
      addLog('error', 'No hay conexión activa.')
      return false
    }
    try {
      const writer = portRef.current.writable.getWriter()
      await writer.write(new TextEncoder().encode(text + lineEnding))
      writer.releaseLock()
      addLog('tx', text)
      return true
    } catch (err) {
      addLog('error', `Error al enviar: ${err.message}`)
      return false
    }
  }, [isConnected, lineEnding, addLog])

  const handleSend = () => {
    if (!input.trim()) return
    sendText(input.trim())
    setInput('')
  }

  const addCmd = () => {
    if (!newLabel.trim() || !newCommand.trim()) return
    setCommands(prev => [...prev, { id: nextId++, label: newLabel.trim(), command: newCommand.trim() }])
    setNewLabel('')
    setNewCommand('')
    setShowAddCmd(false)
  }

  const handleDictExecute = async (row) => {
    const executable = bestExecutable(row)
    if (hasParams(executable)) {
      // Has unfilled params — load into input bar for the user to fill
      setInput(executable)
      setShowDict(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // No params — send directly
      const sent = await sendText(executable)
      if (sent) setShowDict(false)
    }
  }

  const portLabel = (port, i) => {
    const info = port.getInfo?.() ?? {}
    const vendor = info.usbVendorId ? ` (${info.usbVendorId.toString(16).toUpperCase()})` : ''
    return `Puerto ${i + 1}${vendor}`
  }

  const dictActionsCell = ({ data }) => {
    const executable = bestExecutable(data)
    const needsParams = hasParams(executable)
    return (
      <button
        className={`sc-dict__exec-btn ${needsParams ? 'sc-dict__exec-btn--params' : ''}`}
        onClick={() => handleDictExecute(data)}
        title={needsParams ? `Carga en la barra de entrada para completar parámetros:\n${executable}` : `Enviar: ${executable}`}
      >
        {needsParams ? '✎ Editar' : '▶ Ejecutar'}
      </button>
    )
  }

  const categoryCell = ({ value }) => (
    <span className={`sc-cat sc-cat--${(value ?? '').toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>
  )

  const codeCell = ({ value }) => value && value !== 'N/A'
    ? <code className="sc-code">{value}</code>
    : <span className="sc-na">—</span>

  if (!isSupported) {
    return (
      <div className="sc-unsupported">
        <p className="sc-unsupported__title">Web Serial API no disponible</p>
        <p>Usa <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong> para acceder al puerto serial.</p>
      </div>
    )
  }

  return (
    <div className="sc">

      {/* ── Dictionary modal ── */}
      <AppModal
        visible={showDict}
        onClose={() => setShowDict(false)}
        title="Diccionario AT"
        subtitle="Referencia de comandos Skypatrol — haz clic en Ejecutar para enviar"
        icon={<CIcon icon={cilBook} />}
        variant="center"
        size="xl"
      >
        {!isConnected && (
          <div className="sc-dict__warn-banner">
            Sin conexión — los comandos se cargarán en la barra de entrada al ejecutar
          </div>
        )}
        <StandardGrid
          dataSource={SKYPATROL_COMMANDS}
          keyExpr="id"
          wordWrapEnabled={false}
          style={{ margin: 0 }}
          height="calc(80vh - 140px)"
          scrolling={{ showScrollbar: 'onHover', mode: 'standard' }}
        >
          <SearchPanel visible placeholder="Buscar comando, nombre, descripción…" />
          <HeaderFilter visible />
          <GroupPanel visible emptyPanelText="Arrastra Categoría aquí para agrupar" />
          <Grouping autoExpandAll={false} />
          <Paging defaultPageSize={15} />
          <Pager showPageSizeSelector allowedPageSizes={[10, 15, 30, 50]} showInfo />

          <Column dataField="category" caption="Categoría" width={120} cellRender={categoryCell} groupIndex={0} />
          <Column dataField="command"  caption="Comando"   width={160} cellRender={({ value }) => <code className="sc-code">{value}</code>} />
          <Column dataField="name"     caption="Nombre"    minWidth={120} />
          <Column dataField="writeFormat" caption="Write Format" width={200} cellRender={codeCell} />
          <Column dataField="readFormat"  caption="Read Format"  width={160} cellRender={codeCell} />
          <Column
            caption="Acción"
            width={100}
            allowSorting={false}
            allowFiltering={false}
            allowGrouping={false}
            cellRender={dictActionsCell}
            fixed
            fixedPosition="right"
          />
          <MasterDetail enabled component={DictDetail} />
        </StandardGrid>
      </AppModal>

      {/* ── Toolbar ── */}
      <div className="sc__toolbar">
        <div className="sc__toolbar-group">
          <select
            className="sc__select"
            value={selectedIndex}
            onChange={e => setSelectedIndex(Number(e.target.value))}
            disabled={isConnected}
          >
            {ports.length === 0
              ? <option value={-1}>Sin puertos disponibles</option>
              : ports.map((p, i) => <option key={i} value={i}>{portLabel(p, i)}</option>)
            }
          </select>
          <button className="sc__btn sc__btn--ghost" onClick={requestPort} disabled={isConnected} title="Agregar puerto">
            <CIcon icon={cilPlus} size="sm" />
          </button>
          <button className="sc__btn sc__btn--ghost" onClick={loadPorts} disabled={isConnected} title="Refrescar">
            <CIcon icon={cilReload} size="sm" />
          </button>
        </div>

        <div className="sc__toolbar-group">
          <select
            className="sc__select sc__select--sm"
            value={baudRate}
            onChange={e => setBaudRate(Number(e.target.value))}
            disabled={isConnected}
          >
            {BAUD_RATES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className="sc__select sc__select--sm"
            value={lineEnding}
            onChange={e => setLineEnding(e.target.value)}
          >
            {LINE_ENDINGS.map(le => <option key={le.label} value={le.value}>{le.label}</option>)}
          </select>
        </div>

        <div className="sc__toolbar-group sc__toolbar-group--end">
          <span className={`sc__badge sc__badge--${isConnected ? 'on' : 'off'}`}>
            {isConnected ? '● Conectado' : '○ Desconectado'}
          </span>
          {isConnected
            ? <button className="sc__btn sc__btn--danger" onClick={disconnect}>
                <CIcon icon={cilLinkBroken} size="sm" /> Desconectar
              </button>
            : <button
                className="sc__btn sc__btn--primary"
                onClick={connect}
                disabled={isConnecting || ports.length === 0}
              >
                {isConnecting
                  ? <><CSpinner size="sm" /> Conectando…</>
                  : <><CIcon icon={cilLink} size="sm" /> Conectar</>
                }
              </button>
          }
        </div>
      </div>

      {/* ── Command palette ── */}
      <div className="sc__palette">
        <button className="sc__btn sc__btn--dict" onClick={() => setShowDict(true)}>
          <CIcon icon={cilBook} size="sm" /> Diccionario AT
        </button>

        <div className="sc__palette-divider" />

        {commands.map(cmd => (
          <div key={cmd.id} className="sc__cmd">
            <button
              className="sc__cmd-btn"
              onClick={() => sendText(cmd.command)}
              disabled={!isConnected}
              title={cmd.command}
            >
              {cmd.label}
            </button>
            <button className="sc__cmd-remove" onClick={() => setCommands(p => p.filter(c => c.id !== cmd.id))}>
              <CIcon icon={cilX} size="sm" />
            </button>
          </div>
        ))}

        {showAddCmd ? (
          <div className="sc__add-cmd">
            <input className="sc__mini-input" placeholder="Nombre" value={newLabel}
              onChange={e => setNewLabel(e.target.value)} />
            <input className="sc__mini-input" placeholder="Comando" value={newCommand}
              onChange={e => setNewCommand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCmd()} />
            <button className="sc__btn sc__btn--primary sc__btn--xs" onClick={addCmd}>OK</button>
            <button className="sc__btn sc__btn--ghost sc__btn--xs" onClick={() => setShowAddCmd(false)}>✕</button>
          </div>
        ) : (
          <button className="sc__btn sc__btn--ghost sc__btn--add" onClick={() => setShowAddCmd(true)}>
            <CIcon icon={cilPlus} size="sm" /> Nuevo
          </button>
        )}
      </div>

      {/* ── Terminal ── */}
      <div className="sc__terminal">
        <div className="sc__terminal-bar">
          <span>Terminal</span>
          <button className="sc__btn sc__btn--ghost sc__btn--xs" onClick={() => setLog([])}>
            <CIcon icon={cilTrash} size="sm" /> Limpiar
          </button>
        </div>
        <div className="sc__log">
          {log.length === 0 && (
            <span className="sc__log-empty">Conecta un dispositivo y envía un comando para ver la respuesta.</span>
          )}
          {log.map(entry => (
            <div key={entry.id} className={`sc__line sc__line--${entry.type}`}>
              <span className="sc__line-time">{entry.time}</span>
              <span className="sc__line-prefix">
                {entry.type === 'tx' ? '►' : entry.type === 'rx' ? '◄' : entry.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <span className="sc__line-text">{entry.text}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="sc__input-bar">
        <input
          ref={inputRef}
          className="sc__input"
          placeholder={isConnected ? 'Escribe un comando…' : 'Conecta el dispositivo para enviar comandos'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={!isConnected}
        />
        <button
          className="sc__btn sc__btn--primary"
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
        >
          <CIcon icon={cilSend} size="sm" /> Enviar
        </button>
      </div>
    </div>
  )
}

export default SerialConsole
