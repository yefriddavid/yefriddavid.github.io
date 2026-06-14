import React from 'react'
import { useForm } from 'react-hook-form'
import './Bastidor.scss'

const DEFAULTS = { w: 50, h: 70, p: 4, prof: 2.5, joint: 'tope' }

const JOINTS = [
  {
    value: 'tope',
    label: 'A tope',
    desc: 'Los horizontales pasan de punta a punta. Los verticales encajan entre ellos.',
  },
  {
    value: 'inglete',
    label: 'Inglete 45°',
    desc: 'Todos los palos se cortan en ángulo de 45°. Se mide siempre por el borde exterior.',
  },
  {
    value: 'mediamadera',
    label: 'Media madera',
    desc: 'Todos van de extremo a extremo. Se talla una ranura de mitad del grosor en cada esquina.',
  },
]

function calcCuts(w, h, p, joint) {
  w = +w
  h = +h
  p = +p
  if (!w || !h || !p) return null
  switch (joint) {
    case 'tope':
      return [
        { qty: 2, length: w, dir: 'Horizontal', note: 'Corte recto' },
        { qty: 2, length: +(h - 2 * p).toFixed(1), dir: 'Vertical', note: 'Corte recto' },
      ]
    case 'inglete':
      return [
        {
          qty: 2,
          length: w,
          dir: 'Horizontal',
          note: 'Corte 45° en ambos extremos — medir por el borde exterior',
        },
        {
          qty: 2,
          length: h,
          dir: 'Vertical',
          note: 'Corte 45° en ambos extremos — medir por el borde exterior',
        },
      ]
    case 'mediamadera':
      return [
        {
          qty: 2,
          length: w,
          dir: 'Horizontal',
          note: `Ranura en cada extremo: ${+(p / 2).toFixed(2)} cm prof. × ${p} cm ancho`,
        },
        {
          qty: 2,
          length: h,
          dir: 'Vertical',
          note: `Ranura en cada extremo: ${+(p / 2).toFixed(2)} cm prof. × ${p} cm ancho`,
        },
      ]
    default:
      return null
  }
}

// ── SVG helpers ─────────────────────────────────────────────────────────────

const BLUE = '#4f46e5'
const WOOD_H = '#C4956A'
const WOOD_V = '#9B6A3A'
const STROKE = '#7B5335'
const SVG_W = 480
const SVG_H = 400

function DimLine({ x1, y1, x2, y2, label, variant = 'blue', vertical = false }) {
  const color = variant === 'blue' ? BLUE : STROKE
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const markId = variant === 'blue' ? 'bArr' : 'wArr'
  const lw = label.length * 6 + 10

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.5}
        markerStart={`url(#${markId})`}
        markerEnd={`url(#${markId})`}
      />
      <rect
        x={mx - lw / 2}
        y={my - 9}
        width={lw}
        height={18}
        fill="var(--cui-body-bg,#fff)"
        rx={3}
      />
      {vertical ? (
        <text
          x={mx}
          y={my}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={11}
          fontWeight={700}
          transform={`rotate(-90,${mx},${my})`}
        >
          {label}
        </text>
      ) : (
        <text
          x={mx}
          y={my}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={11}
          fontWeight={700}
        >
          {label}
        </text>
      )}
    </g>
  )
}

function TickLine({ x, y1, y2, color }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={1.2} />
}
function TickLineH({ y, x1, x2, color }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.2} />
}

function FrameSVG({ w, h, p, joint }) {
  w = +w
  h = +h
  p = +p
  if (!w || !h || !p || h - 2 * p <= 0) {
    return <div className="bastidor__empty">Ingresa medidas válidas para ver el diagrama</div>
  }

  const PAD = { top: 55, right: 65, bottom: 45, left: 20 }
  const availW = SVG_W - PAD.left - PAD.right
  const availH = SVG_H - PAD.top - PAD.bottom
  const scale = Math.min(availW / w, availH / h)
  const fw = w * scale
  const fh = h * scale
  const fp = Math.max(p * scale, 10)
  const ox = PAD.left + (availW - fw) / 2
  const oy = PAD.top + (availH - fh) / 2

  const innerW = fw - 2 * fp
  const innerH = fh - 2 * fp

  // Build corner polygons for inglete (45° miter cuts visible)
  const topPoly = `${ox},${oy} ${ox + fw},${oy} ${ox + fw - fp},${oy + fp} ${ox + fp},${oy + fp}`
  const botPoly = `${ox + fp},${oy + fh - fp} ${ox + fw - fp},${oy + fh - fp} ${ox + fw},${oy + fh} ${ox},${oy + fh}`
  const leftPoly = `${ox},${oy} ${ox + fp},${oy + fp} ${ox + fp},${oy + fh - fp} ${ox},${oy + fh}`
  const rightPoly = `${ox + fw},${oy} ${ox + fw},${oy + fh} ${ox + fw - fp},${oy + fh - fp} ${ox + fw - fp},${oy + fp}`

  const paloDim = `${p} cm`

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="bastidor__svg"
      aria-label="Diagrama del bastidor"
    >
      <defs>
        {['bArr', 'wArr'].map((id, i) => (
          <marker
            key={id}
            id={id}
            markerWidth="7"
            markerHeight="7"
            refX="3.5"
            refY="3.5"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L6,3.5 L0,6 Z" fill={i === 0 ? BLUE : STROKE} />
          </marker>
        ))}
      </defs>

      {/* ── Wood pieces ── */}

      {joint === 'inglete' ? (
        <>
          <polygon
            points={topPoly}
            fill={WOOD_H}
            stroke={STROKE}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <polygon
            points={botPoly}
            fill={WOOD_H}
            stroke={STROKE}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <polygon
            points={leftPoly}
            fill={WOOD_V}
            stroke={STROKE}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <polygon
            points={rightPoly}
            fill={WOOD_V}
            stroke={STROKE}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </>
      ) : joint === 'tope' ? (
        <>
          <rect
            x={ox}
            y={oy}
            width={fw}
            height={fp}
            fill={WOOD_H}
            stroke={STROKE}
            strokeWidth={1}
          />
          <rect
            x={ox}
            y={oy + fh - fp}
            width={fw}
            height={fp}
            fill={WOOD_H}
            stroke={STROKE}
            strokeWidth={1}
          />
          <rect
            x={ox}
            y={oy + fp}
            width={fp}
            height={fh - 2 * fp}
            fill={WOOD_V}
            stroke={STROKE}
            strokeWidth={1}
          />
          <rect
            x={ox + fw - fp}
            y={oy + fp}
            width={fp}
            height={fh - 2 * fp}
            fill={WOOD_V}
            stroke={STROKE}
            strokeWidth={1}
          />
        </>
      ) : (
        // media madera — show overlap zones at corners
        <>
          <rect
            x={ox}
            y={oy}
            width={fw}
            height={fp}
            fill={WOOD_H}
            stroke={STROKE}
            strokeWidth={1}
          />
          <rect
            x={ox}
            y={oy + fh - fp}
            width={fw}
            height={fp}
            fill={WOOD_H}
            stroke={STROKE}
            strokeWidth={1}
          />
          <rect
            x={ox}
            y={oy}
            width={fp}
            height={fh}
            fill={WOOD_V}
            stroke={STROKE}
            strokeWidth={1}
            fillOpacity={0.55}
          />
          <rect
            x={ox + fw - fp}
            y={oy}
            width={fp}
            height={fh}
            fill={WOOD_V}
            stroke={STROKE}
            strokeWidth={1}
            fillOpacity={0.55}
          />
          {/* corner notch markers */}
          {[
            [ox, oy],
            [ox + fw - fp, oy],
            [ox, oy + fh - fp],
            [ox + fw - fp, oy + fh - fp],
          ].map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx}
              y={cy}
              width={fp}
              height={fp}
              fill="none"
              stroke="#c45"
              strokeWidth={1.5}
              strokeDasharray="3,2"
            />
          ))}
        </>
      )}

      {/* ── Inner opening ── */}
      <rect
        x={ox + fp}
        y={oy + fp}
        width={innerW}
        height={innerH}
        fill="rgba(200,215,255,0.12)"
        stroke="#bbb"
        strokeDasharray="5,4"
        strokeWidth={1}
      />

      {/* ── Text on pieces ── */}
      {fw > 80 && (
        <text
          x={ox + fw / 2}
          y={oy + fp / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={Math.min(fp * 0.5, 11)}
          fontWeight={700}
          pointerEvents="none"
        >
          {w} cm
        </text>
      )}
      {joint === 'tope' && fh - 2 * fp > 25 && fp > 12 && (
        <text
          x={ox + fp / 2}
          y={oy + fp + (fh - 2 * fp) / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={Math.min(fp * 0.45, 10)}
          fontWeight={700}
          pointerEvents="none"
          transform={`rotate(-90,${ox + fp / 2},${oy + fp + (fh - 2 * fp) / 2})`}
        >
          {+(h - 2 * p).toFixed(1)} cm
        </text>
      )}

      {/* ── Outer dimension: width ── */}
      <DimLine x1={ox} y1={oy - 32} x2={ox + fw} y2={oy - 32} label={`${w} cm`} />
      <TickLine x={ox} y1={oy - 38} y2={oy - 26} color={BLUE} />
      <TickLine x={ox + fw} y1={oy - 38} y2={oy - 26} color={BLUE} />

      {/* ── Outer dimension: height ── */}
      <DimLine
        x1={ox + fw + 42}
        y1={oy}
        x2={ox + fw + 42}
        y2={oy + fh}
        label={`${h} cm`}
        vertical
      />
      <TickLineH y={oy} x1={ox + fw + 36} x2={ox + fw + 48} color={BLUE} />
      <TickLineH y={oy + fh} x1={ox + fw + 36} x2={ox + fw + 48} color={BLUE} />

      {/* ── Palo width indicator (bottom) ── */}
      {fp > 14 && (
        <>
          <DimLine
            x1={ox}
            y1={oy + fh + 30}
            x2={ox + fp}
            y2={oy + fh + 30}
            label={paloDim}
            variant="wood"
          />
          <TickLine x={ox} y1={oy + fh + 25} y2={oy + fh + 35} color={STROKE} />
          <TickLine x={ox + fp} y1={oy + fh + 25} y2={oy + fh + 35} color={STROKE} />
        </>
      )}

      {/* ── Legend ── */}
      <rect
        x={8}
        y={SVG_H - 50}
        width={12}
        height={12}
        fill={WOOD_H}
        stroke={STROKE}
        strokeWidth={1}
        rx={2}
      />
      <text x={24} y={SVG_H - 43} fill="var(--cui-body-color,#333)" fontSize={10}>
        Horizontal
      </text>
      <rect
        x={8}
        y={SVG_H - 34}
        width={12}
        height={12}
        fill={WOOD_V}
        stroke={STROKE}
        strokeWidth={1}
        rx={2}
      />
      <text x={24} y={SVG_H - 27} fill="var(--cui-body-color,#333)" fontSize={10}>
        Vertical
      </text>
    </svg>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

const Bastidor = () => {
  const { register, watch } = useForm({ defaultValues: DEFAULTS })
  const { w, h, p, prof, joint } = watch()
  const cuts = calcCuts(w, h, p, joint)

  return (
    <div className="bastidor">
      <div className="bastidor__form-panel">
        <p className="bastidor__form-title">Parámetros del bastidor</p>

        <div className="bastidor__field-group">
          <label className="bastidor__label">Ancho del bastidor (cm)</label>
          <input className="bastidor__input" type="number" min={1} step={0.5} {...register('w')} />
        </div>
        <div className="bastidor__field-group">
          <label className="bastidor__label">Alto del bastidor (cm)</label>
          <input className="bastidor__input" type="number" min={1} step={0.5} {...register('h')} />
        </div>

        <hr className="bastidor__sep" />
        <p className="bastidor__form-subtitle">Dimensiones del palo</p>

        <div className="bastidor__fields-row">
          <div className="bastidor__field-group">
            <label className="bastidor__label">Ancho (cm)</label>
            <input
              className="bastidor__input"
              type="number"
              min={0.5}
              step={0.5}
              {...register('p')}
            />
          </div>
          <div className="bastidor__field-group">
            <label className="bastidor__label">Profundidad (cm)</label>
            <input
              className="bastidor__input"
              type="number"
              min={0.5}
              step={0.5}
              {...register('prof')}
            />
          </div>
        </div>

        <hr className="bastidor__sep" />
        <p className="bastidor__form-subtitle">Tipo de ensamble en esquinas</p>

        <div className="bastidor__joints">
          {JOINTS.map((j) => (
            <label
              key={j.value}
              className={`bastidor__joint${joint === j.value ? ' bastidor__joint--active' : ''}`}
            >
              <input
                type="radio"
                value={j.value}
                {...register('joint')}
                className="bastidor__joint-radio"
              />
              <span className="bastidor__joint-label">{j.label}</span>
              <span className="bastidor__joint-desc">{j.desc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bastidor__result-panel">
        <div className="bastidor__diagram-card">
          <FrameSVG w={w} h={h} p={p} joint={joint} />
        </div>

        {cuts && (
          <div className="bastidor__cuts-card">
            <p className="bastidor__cuts-title">Lista de cortes</p>
            {cuts.map((c, i) => (
              <div key={i} className="bastidor__cut">
                <div className="bastidor__cut__qty">{c.qty} ×</div>
                <div className="bastidor__cut__info">
                  <span className="bastidor__cut__length">{c.length} cm</span>
                  <span className="bastidor__cut__dir">{c.dir}</span>
                </div>
                <div className="bastidor__cut__note">{c.note}</div>
              </div>
            ))}
            <div className="bastidor__cuts-total">
              Total de madera: {cuts.reduce((acc, c) => acc + c.qty * c.length, 0).toFixed(1)} cm (
              {(cuts.reduce((acc, c) => acc + c.qty * c.length, 0) / 100).toFixed(2)} m)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bastidor
