import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import { hasAuditChatKey, sendAuditMessage } from 'src/services/anthropic/auditChat'

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

const SettlementsAuditChat = ({ period, settlements, expenses }) => {
  const { attachments } = useSelector((s) => s.taxiPeriodAttachment)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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
      })
      setMessages([...history, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
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
      </CCardBody>
    </CCard>
  )
}

export default SettlementsAuditChat
