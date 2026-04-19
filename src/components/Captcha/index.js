import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 5

function generateCode() {
  return Array.from({ length: CODE_LENGTH }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

function drawCaptcha(canvas, code) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  // Background
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, W, H)

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 193, 7, 0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 16) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 16) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Noise dots
  for (let i = 0; i < 120; i++) {
    const alpha = 0.04 + Math.random() * 0.18
    ctx.fillStyle = `rgba(255, 193, 7, ${alpha})`
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8, 0, Math.PI * 2)
    ctx.fill()
  }

  // Interference curves
  for (let i = 0; i < 5; i++) {
    const alpha = 0.08 + Math.random() * 0.14
    ctx.strokeStyle = `rgba(255, 193, 7, ${alpha})`
    ctx.lineWidth = 1 + Math.random()
    ctx.beginPath()
    ctx.moveTo(Math.random() * W * 0.3, Math.random() * H)
    ctx.bezierCurveTo(
      Math.random() * W, Math.random() * H,
      Math.random() * W, Math.random() * H,
      W * 0.7 + Math.random() * W * 0.3, Math.random() * H,
    )
    ctx.stroke()
  }

  // Characters
  const slotW = W / (CODE_LENGTH + 1)
  code.split('').forEach((char, i) => {
    const x = slotW * (i + 0.75) + (Math.random() - 0.5) * 6
    const y = H * 0.62 + (Math.random() - 0.5) * 8
    const angle = (Math.random() - 0.5) * 0.45
    const size = 22 + Math.random() * 5

    // Glow shadow
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.shadowColor = 'rgba(255, 193, 7, 0.6)'
    ctx.shadowBlur = 8

    // Random amber shade per char
    const g = 160 + Math.floor(Math.random() * 73)
    const a = 0.75 + Math.random() * 0.25
    ctx.fillStyle = `rgba(255, ${g}, 0, ${a})`
    ctx.font = `bold ${size}px 'Courier New', monospace`
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  // Top border glow
  const gradient = ctx.createLinearGradient(0, 0, W, 0)
  gradient.addColorStop(0, 'transparent')
  gradient.addColorStop(0.5, 'rgba(255, 193, 7, 0.25)')
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, 1)
}

// ── Refresh icon ───────────────────────────────────────────────────
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

// ── Component ──────────────────────────────────────────────────────
const Captcha = forwardRef(({ onValidChange }, ref) => {
  const canvasRef = useRef(null)
  const [code, setCode] = useState(generateCode)
  const [input, setInput] = useState('')
  const [shaking, setShaking] = useState(false)

  const isMatch = input.toUpperCase() === code

  const refresh = useCallback(() => {
    setCode(generateCode())
    setInput('')
    onValidChange?.(false)
  }, [onValidChange])

  useImperativeHandle(ref, () => ({
    isValid: () => isMatch,
    reset: refresh,
  }), [isMatch, refresh])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCaptcha(canvas, code)
  }, [code])

  useEffect(() => {
    if (input.length === CODE_LENGTH) {
      if (isMatch) {
        onValidChange?.(true)
      } else {
        setShaking(true)
        onValidChange?.(false)
        setTimeout(() => {
          setShaking(false)
          refresh()
        }, 500)
      }
    } else {
      onValidChange?.(false)
    }
  }, [input]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ marginBottom: 20 }}>
      <label className="login-page__label">Verificación</label>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
        <div style={{
          position: 'relative',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid rgba(255, 193, 7, 0.2)',
          boxShadow: '0 0 20px rgba(255, 193, 7, 0.05)',
          flex: 1,
        }}>
          <canvas
            ref={canvasRef}
            width={220}
            height={56}
            style={{ display: 'block', width: '100%', height: 56, userSelect: 'none' }}
          />
        </div>

        <button
          type="button"
          onClick={refresh}
          title="Nuevo código"
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            background: 'rgba(255, 193, 7, 0.08)',
            border: '1px solid rgba(255, 193, 7, 0.2)',
            borderRadius: 8,
            color: 'rgba(255, 193, 7, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 193, 7, 0.16)'
            e.currentTarget.style.color = '#ffc107'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 193, 7, 0.08)'
            e.currentTarget.style.color = 'rgba(255, 193, 7, 0.7)'
          }}
        >
          <IconRefresh />
        </button>
      </div>

      <div
        className="login-page__input-wrap"
        style={shaking ? { animation: 'captchaShake 0.4s ease' } : {}}
      >
        <span className="login-page__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <input
          className="login-page__input"
          type="text"
          placeholder="Escribe el código"
          maxLength={CODE_LENGTH}
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          autoComplete="off"
          spellCheck={false}
          style={{
            letterSpacing: '0.25em',
            fontFamily: "'Courier New', monospace",
            ...(input.length === CODE_LENGTH && isMatch ? {
              borderColor: 'rgba(46, 213, 115, 0.5)',
              background: 'rgba(46, 213, 115, 0.06)',
            } : {}),
          }}
        />
        {input.length === CODE_LENGTH && isMatch && (
          <span style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#2ed573',
            display: 'flex',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>

      <style>{`
        @keyframes captchaShake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
})

Captcha.displayName = 'Captcha'
export default Captcha
