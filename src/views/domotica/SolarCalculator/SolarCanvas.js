import React, { useRef, useEffect, useCallback } from 'react'

const W = 900
const H = 210
const CY = 125
const BOX_W = 112
const BOX_H = 80

const COMPS = [
  { id: 'panels',     label: 'Paneles',     cx: 100, color: '#f59e0b' },
  { id: 'controller', label: 'Controlador', cx: 270, color: '#3b82f6' },
  { id: 'battery',    label: 'Baterías',    cx: 450, color: '#10b981' },
  { id: 'inverter',   label: 'Inversor',    cx: 630, color: '#8b5cf6' },
  { id: 'loads',      label: 'Consumo',     cx: 800, color: '#ef4444' },
]

// Night palette (app light → calculator dark sky)
const NIGHT = {
  bgTop: '#0d1526',
  bgBot: '#131e30',
  sunRay: '#fbbf2488',
  sunLine: '#fbbf2440',
  arrowDC: '#3b82f640',
  arrowAC: '#f59e0b40',
  arrowDCHead: '#3b82f640',
  arrowACHead: '#f59e0b40',
  arrowLabel: '#4a6080',
  dcBadge: '#3b82f666',
  acBadge: '#f59e0b66',
  boxTop: (isS, c) => isS ? c + '28' : '#1b2940',
  boxBot: (isS, c) => isS ? c + '10' : '#111e30',
  boxBorder: (isH, isS, c) => isH || isS ? c : '#263347',
  shadow: (c) => c,
  labelColor: (isH, isS, c) => isH || isS ? c : '#6a88a4',
  valColor: '#4a6080',
}

// Day palette (app dark → calculator bright sky)
const DAY = {
  bgTop: '#7ec8e3',
  bgBot: '#d0ecf8',
  sunRay: '#fbbf24cc',
  sunLine: '#fbbf2466',
  arrowDC: '#3b82f6aa',
  arrowAC: '#f59e0baa',
  arrowDCHead: '#3b82f6aa',
  arrowACHead: '#f59e0baa',
  arrowLabel: '#4a7090',
  dcBadge: '#3b82f6cc',
  acBadge: '#f59e0bcc',
  boxTop: (isS, c) => isS ? c + '30' : 'rgba(255,255,255,0.92)',
  boxBot: (isS, c) => isS ? c + '15' : 'rgba(240,249,255,0.96)',
  boxBorder: (isH, isS, c) => isH || isS ? c : '#94a3b8',
  shadow: (c) => c,
  labelColor: (isH, isS, c) => isH || isS ? c : '#334155',
  valColor: '#5a7890',
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawPanels(ctx, cx, cy, color) {
  const cw = 13, ch = 8, gap = 2, cols = 3, rows = 2
  const tw = cols * cw + (cols - 1) * gap
  const th = rows * ch + (rows - 1) * gap
  const sx = cx - tw / 2, sy = cy - th / 2 - 4
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = sx + c * (cw + gap), y = sy + r * (ch + gap)
      ctx.strokeRect(x, y, cw, ch)
      ctx.beginPath(); ctx.moveTo(x, y + ch / 2); ctx.lineTo(x + cw, y + ch / 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x + cw / 2, y); ctx.lineTo(x + cw / 2, y + ch); ctx.stroke()
    }
  }
}

function drawController(ctx, cx, cy, color) {
  const w = 30, h = 22
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.strokeRect(cx - w / 2, cy - h / 2 - 4, w, h)
  ctx.font = 'bold 7px system-ui'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('DC/DC', cx, cy - 4)
}

function drawBattery(ctx, cx, cy, color) {
  const w = 32, h = 16
  const bx = cx - w / 2, by = cy - h / 2 - 4
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.strokeRect(bx, by, w, h)
  ctx.fillStyle = color
  ctx.fillRect(bx + w, by + h * 0.28, 4, h * 0.44)
  ctx.fillStyle = color + '55'
  ctx.fillRect(bx + 2, by + 2, (w - 4) * 0.65, h - 4)
  ctx.font = 'bold 8px system-ui'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('+', cx + w * 0.27, cy - 4)
  ctx.fillText('−', cx - w * 0.27, cy - 4)
}

function drawInverter(ctx, cx, cy, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 16, cy - 14)
  ctx.lineTo(cx + 14, cy - 4)
  ctx.lineTo(cx - 16, cy + 6)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.lineWidth = 1.2
  for (let x = 0; x <= 18; x++) {
    const px = cx + 16 + x
    const py = cy - 4 + Math.sin((x / 18) * Math.PI * 2) * 5
    if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.stroke()
}

function drawHouse(ctx, cx, cy, color) {
  const s = 13
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy - s - 4)
  ctx.lineTo(cx + s, cy - s * 0.2 - 4)
  ctx.lineTo(cx + s, cy + s * 0.8 - 4)
  ctx.lineTo(cx - s, cy + s * 0.8 - 4)
  ctx.lineTo(cx - s, cy - s * 0.2 - 4)
  ctx.closePath()
  ctx.stroke()
  ctx.strokeRect(cx - s * 0.3, cy + s * 0.07 - 4, s * 0.6, s * 0.73)
}

const ICON_FNS = {
  panels: drawPanels,
  controller: drawController,
  battery: drawBattery,
  inverter: drawInverter,
  loads: drawHouse,
}

export default function SolarCanvas({ hovered, selected, onHover, onClick, flowLabels = {}, dayMode = false }) {
  const canvasRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')
    const P = dayMode ? DAY : NIGHT
    ctx.clearRect(0, 0, W * dpr, H * dpr)
    ctx.save()
    ctx.scale(dpr, dpr)

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, P.bgTop)
    bg.addColorStop(1, P.bgBot)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Sun above panels
    const scx = COMPS[0].cx, scy = 28
    const sunR = dayMode ? 14 : 10
    if (dayMode) {
      // Glow halo
      const glow = ctx.createRadialGradient(scx, scy, sunR, scx, scy, sunR * 3)
      glow.addColorStop(0, '#fbbf2466')
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(scx, scy, sunR * 3, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }
    ctx.beginPath()
    ctx.arc(scx, scy, sunR, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()
    ctx.strokeStyle = P.sunRay
    ctx.lineWidth = dayMode ? 2 : 1.5
    const rayCount = dayMode ? 12 : 8
    for (let i = 0; i < rayCount; i++) {
      const a = (i * Math.PI * 2) / rayCount
      ctx.beginPath()
      ctx.moveTo(scx + Math.cos(a) * (sunR + 3), scy + Math.sin(a) * (sunR + 3))
      ctx.lineTo(scx + Math.cos(a) * (sunR + 10), scy + Math.sin(a) * (sunR + 10))
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.setLineDash([3, 3])
    ctx.strokeStyle = P.sunLine
    ctx.lineWidth = 1
    ctx.moveTo(scx, scy + sunR + 1)
    ctx.lineTo(scx, CY - BOX_H / 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Arrows
    COMPS.forEach((comp, i) => {
      if (i >= COMPS.length - 1) return
      const next = COMPS[i + 1]
      const x1 = comp.cx + BOX_W / 2
      const x2 = next.cx - BOX_W / 2
      const mid = (x1 + x2) / 2
      const isAC = i >= 3

      ctx.setLineDash([5, 4])
      ctx.strokeStyle = isAC ? P.arrowAC : P.arrowDC
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x1, CY)
      ctx.lineTo(x2 - 8, CY)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.fillStyle = isAC ? P.arrowACHead : P.arrowDCHead
      ctx.moveTo(x2, CY)
      ctx.lineTo(x2 - 8, CY - 4)
      ctx.lineTo(x2 - 8, CY + 4)
      ctx.fill()

      const arrowLabel = flowLabels[`${comp.id}_${next.id}`]
      if (arrowLabel) {
        ctx.font = '9px system-ui'
        ctx.fillStyle = P.arrowLabel
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(arrowLabel, mid, CY - 6)
      }
      ctx.font = 'bold 7px system-ui'
      ctx.fillStyle = isAC ? P.acBadge : P.dcBadge
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(isAC ? 'AC' : 'DC', mid, CY + 5)
    })

    // Component boxes
    COMPS.forEach((comp) => {
      const isH = hovered === comp.id
      const isS = selected === comp.id
      const bx = comp.cx - BOX_W / 2
      const by = CY - BOX_H / 2

      if (isH || isS) {
        ctx.shadowColor = P.shadow(comp.color)
        ctx.shadowBlur = isH ? 22 : 14
      }

      roundRect(ctx, bx, by, BOX_W, BOX_H, 10)
      const grad = ctx.createLinearGradient(bx, by, bx, by + BOX_H)
      grad.addColorStop(0, P.boxTop(isS, comp.color))
      grad.addColorStop(1, P.boxBot(isS, comp.color))
      ctx.fillStyle = grad
      ctx.fill()

      if (dayMode) {
        ctx.shadowColor = 'rgba(0,0,0,0.12)'
        ctx.shadowBlur = isH || isS ? 0 : 6
        ctx.shadowOffsetY = isH || isS ? 0 : 2
      }

      roundRect(ctx, bx, by, BOX_W, BOX_H, 10)
      ctx.strokeStyle = P.boxBorder(isH, isS, comp.color)
      ctx.lineWidth = isH || isS ? 2 : 1
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      const iconFn = ICON_FNS[comp.id]
      if (iconFn) iconFn(ctx, comp.cx, CY - 10, comp.color)

      ctx.font = `${isH || isS ? 'bold' : 'normal'} 11px system-ui`
      ctx.fillStyle = P.labelColor(isH, isS, comp.color)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(comp.label, comp.cx, CY + 14)

      const val = flowLabels[comp.id]
      if (val) {
        ctx.font = '9px system-ui'
        ctx.fillStyle = P.valColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(val, comp.cx, CY + 27)
      }
    })

    ctx.restore()
  }, [hovered, selected, flowLabels, dayMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
  }, [])

  useEffect(() => { draw() }, [draw])

  const getComp = (clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (W / rect.width)
    const y = (clientY - rect.top) * (H / rect.height)
    return COMPS.find(c =>
      x >= c.cx - BOX_W / 2 && x <= c.cx + BOX_W / 2 &&
      y >= CY - BOX_H / 2 && y <= CY + BOX_H / 2,
    ) ?? null
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ cursor: hovered ? 'pointer' : 'default', maxWidth: '100%', display: 'block' }}
      onMouseMove={(e) => { const c = getComp(e.clientX, e.clientY); onHover(c?.id ?? null) }}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => { const c = getComp(e.clientX, e.clientY); if (c) onClick(c.id) }}
    />
  )
}
