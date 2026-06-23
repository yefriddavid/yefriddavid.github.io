import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import * as taxiAuditNoteActions from 'src/actions/taxi/taxiAuditNoteActions'
import {
  hasAuditChatKey,
  sendAuditMessage,
  proposeAuditNotes,
} from 'src/services/anthropic/auditChat'

const SUGGESTIONS = [
  'Audita este período',
  '¿Hay liquidaciones sin soporte?',
  '¿Hay soportes sin liquidación asociada?',
]

const markdownComponents = {
  p: ({ children }) => <p style={{ margin: '0 0 6px' }}>{children}</p>,
  h1: ({ children }) => (
    <div style={{ fontWeight: 700, fontSize: 14, margin: '8px 0 4px' }}>{children}</div>
  ),
  h2: ({ children }) => (
    <div style={{ fontWeight: 700, fontSize: 14, margin: '8px 0 4px' }}>{children}</div>
  ),
  h3: ({ children }) => (
    <div style={{ fontWeight: 700, fontSize: 13, margin: '8px 0 4px' }}>{children}</div>
  ),
  h4: ({ children }) => (
    <div style={{ fontWeight: 700, fontSize: 13, margin: '8px 0 4px' }}>{children}</div>
  ),
  ul: ({ children }) => <ul style={{ margin: '0 0 6px', paddingLeft: 18 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0 0 6px', paddingLeft: 18 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  code: ({ children }) => (
    <code style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 3, padding: '1px 4px' }}>
      {children}
    </code>
  ),
}

const ChatMessage = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '8px 12px',
          borderRadius: 10,
          fontSize: 13,
          background: isUser ? '#1e3a5f' : '#f1f3f5',
          color: isUser ? '#fff' : '#1e293b',
        }}
      >
        <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
      </div>
    </div>
  )
}

const SettlementsAuditChat = ({ period, settlements, expenses, periodDrivers, auditDays }) => {
  const dispatch = useDispatch()
  const { attachments } = useSelector((s) => s.taxiPeriodAttachment)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [proposing, setProposing] = useState(false)
  const [proposedNotes, setProposedNotes] = useState([])
  const [showNotesModal, setShowNotesModal] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (!hasAuditChatKey()) return null

  const send = async (text) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return
    setInput('')
    setError(null)

    const history = [...messages, { role: 'user', content: userText }]
    setMessages(history)
    setLoading(true)

    try {
      const reply = await sendAuditMessage({
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        period,
        settlements,
        expenses,
        attachments,
        periodDrivers,
        auditDays,
      })
      setMessages([...history, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const proposeNotes = async () => {
    setProposing(true)
    setError(null)
    try {
      const result = await proposeAuditNotes({
        period,
        settlements,
        expenses,
        attachments,
        periodDrivers,
        auditDays,
      })
      const validNotes = (result.notes ?? []).filter((n) =>
        periodDrivers.some((d) => d.name === n.driver),
      )
      if (validNotes.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'No encontré hallazgos que ameriten una nota nueva.' },
        ])
      } else {
        setProposedNotes(validNotes.map((n, i) => ({ ...n, id: i, approved: true })))
        setShowNotesModal(true)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setProposing(false)
    }
  }

  const toggleProposedNote = (id) =>
    setProposedNotes((prev) => prev.map((n) => (n.id === id ? { ...n, approved: !n.approved } : n)))

  const confirmCreateNotes = () => {
    const toCreate = proposedNotes.filter((n) => n.approved)
    toCreate.forEach((n) => {
      dispatch(
        taxiAuditNoteActions.upsertRequest({
          date: n.date,
          driver: n.driver,
          note: n.note,
          resolved: false,
          noteType: 'book',
        }),
      )
    })
    setShowNotesModal(false)
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `Creé ${toCreate.length} nota(s) de auditoría.` },
    ])
  }

  return (
    <CCard className="mt-3">
      <CCardHeader>
        <strong style={{ fontSize: 13 }}>✦ Auditoría con Claude</strong>
        <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
          {period.month}/{period.year} — {settlements.length} liquidaciones, {expenses.length}{' '}
          gastos, {attachments.length} soportes
        </span>
      </CCardHeader>
      <CCardBody>
        <div
          style={{
            maxHeight: 320,
            overflowY: 'auto',
            marginBottom: 12,
            padding: messages.length ? '4px 0' : 0,
          }}
        >
          {messages.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
              Pídele a Claude que audite las liquidaciones de este período contra los soportes
              adjuntos.
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #1e3a5f',
                      background: '#eff6ff',
                      color: '#1e3a5f',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} msg={m} />
          ))}
          {loading && (
            <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>Pensando…</div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <div style={{ fontSize: 12, color: '#e03131', marginBottom: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            placeholder="Pregúntale a Claude sobre este período…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            style={{
              flex: 1,
              fontSize: 13,
              border: '1px solid var(--cui-border-color)',
              borderRadius: 6,
              padding: '6px 10px',
            }}
          />
          <button
            disabled={!input.trim() || loading}
            onClick={() => send()}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #1e3a5f',
              background: !input.trim() || loading ? '#cbd5e1' : '#1e3a5f',
              color: '#fff',
              cursor: !input.trim() || loading ? 'default' : 'pointer',
            }}
          >
            Enviar
          </button>
        </div>

        <button
          disabled={proposing}
          onClick={proposeNotes}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #7c3aed',
            background: '#faf5ff',
            color: '#7c3aed',
            cursor: proposing ? 'default' : 'pointer',
            marginTop: 8,
          }}
        >
          {proposing ? 'Analizando…' : '🔖 Proponer notas de auditoría'}
        </button>
      </CCardBody>

      <CModal
        visible={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        size="lg"
        alignment="center"
        scrollable
      >
        <CModalHeader>
          <CModalTitle style={{ fontSize: 14 }}>Notas automáticas de auditoría</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 12 }}>
            Claude propuso estas notas a partir de las liquidaciones, gastos y soportes del período.
            Desmarca las que no quieras crear y confirma — no se guarda nada hasta que apruebes.
          </p>
          {proposedNotes.map((n) => (
            <label
              key={n.id}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: '1px solid var(--cui-border-color)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={n.approved}
                onChange={() => toggleProposedNote(n.id)}
                style={{ marginTop: 3 }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>
                  {n.date} — {n.driver}
                </div>
                <div style={{ fontSize: 13 }}>{n.note}</div>
              </div>
            </label>
          ))}
        </CModalBody>
        <CModalFooter>
          <button
            onClick={() => setShowNotesModal(false)}
            style={{
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--cui-border-color)',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            disabled={!proposedNotes.some((n) => n.approved)}
            onClick={confirmCreateNotes}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #1e3a5f',
              background: '#1e3a5f',
              color: '#fff',
              cursor: proposedNotes.some((n) => n.approved) ? 'pointer' : 'default',
              opacity: proposedNotes.some((n) => n.approved) ? 1 : 0.5,
            }}
          >
            Crear {proposedNotes.filter((n) => n.approved).length} nota(s)
          </button>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default SettlementsAuditChat
