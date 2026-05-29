import React, { useState, useRef, useEffect } from 'react'
import { sendDesignMessage } from 'src/services/anthropic/designChat'

const SUGGESTIONS = [
  'Centra todos los elementos',
  '¿Cómo ves el diseño?',
  'Mejora la composición',
  'Agrega un título',
]

const Message = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div className={`dchat__msg dchat__msg--${isUser ? 'user' : 'claude'}`}>
      {!isUser && <span className="dchat__msg-avatar">✦</span>}
      <div className="dchat__msg-bubble">{msg.content}</div>
    </div>
  )
}

const DesignChat = ({ canvas, nodes, onNodesChange, onClose }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const send = async (text) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return
    setInput('')

    const userMsg = { role: 'user', content: userText }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const apiMessages = history.map((m) => ({ role: m.role, content: m.content }))
      const result = await sendDesignMessage({ messages: apiMessages, canvasConfig: canvas, nodes })

      const assistantText = result.message ?? 'Listo.'
      setMessages([...history, { role: 'assistant', content: assistantText }])

      if (result.action === 'update_nodes' && Array.isArray(result.nodes)) {
        onNodesChange(result.nodes)
      }
    } catch (e) {
      setMessages([...history, { role: 'assistant', content: `Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dchat">
      <div className="dchat__header">
        <span className="dchat__title">✦ Asistente de diseño</span>
        <button className="dchat__close" onClick={onClose} title="Cerrar">✕</button>
      </div>

      <div className="dchat__messages">
        {messages.length === 0 && (
          <div className="dchat__welcome">
            <span className="dchat__welcome-icon">🎨</span>
            <p>Soy tu asistente de diseño. Puedo crear elementos, opinar sobre tu composición y ayudarte a mejorar el layout.</p>
            <div className="dchat__suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="dchat__suggestion" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div className="dchat__msg dchat__msg--claude">
            <span className="dchat__msg-avatar">✦</span>
            <div className="dchat__msg-bubble dchat__msg-bubble--loading">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="dchat__input-wrap">
        <textarea
          ref={inputRef}
          className="dchat__input"
          value={input}
          placeholder="Pídeme algo…"
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
        />
        <button
          className="dchat__send"
          disabled={!input.trim() || loading}
          onClick={() => send()}
        >
          ↑
        </button>
      </div>
    </div>
  )
}

export default DesignChat
