import React from 'react'

const FONT = 'Arial, Helvetica, sans-serif'
const ORANGE = '#F07820'
const BLACK = '#1a1a1a'
const WHITE = '#ffffff'

const Section = ({ label, text, y }) => {
  const lines = text ? text.split('\n').filter(Boolean) : []
  return (
    <>
      <text x={30} y={y} fill={BLACK} fontSize={22} fontWeight="bold" fontFamily={FONT}>
        {label}
      </text>
      {lines.map((line, i) => (
        <text key={i} x={38} y={y + 30 + i * 28} fill="#444" fontSize={19} fontFamily={FONT}>
          {`• ${line}`}
        </text>
      ))}
    </>
  )
}

const sectionHeight = (text) => {
  const lines = text ? text.split('\n').filter(Boolean).length : 0
  return 30 + lines * 28 + 18
}

const QRPlaceholder = ({ cx, cy, r }) => {
  const s = r * 0.7
  const ox = cx - s / 2
  const oy = cy - s / 2
  const cell = s / 7
  const corners = [
    [0, 0],
    [4, 0],
    [0, 4],
  ]
  const dots = [
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 2],
    [3, 2],
    [1, 3],
    [2, 3],
    [3, 3],
    [5, 1],
    [6, 1],
    [5, 2],
    [6, 2],
    [5, 3],
    [6, 3],
    [1, 5],
    [2, 5],
    [1, 6],
    [2, 6],
    [3, 5],
    [3, 6],
    [2, 2],
    [5, 5],
    [6, 5],
    [5, 6],
    [4, 3],
    [3, 4],
    [4, 4],
    [4, 5],
    [3, 6],
  ]
  return (
    <g>
      {corners.map(([cx2, cy2], i) => (
        <g key={i}>
          <rect
            x={ox + cx2 * cell}
            y={oy + cy2 * cell}
            width={cell * 3}
            height={cell * 3}
            fill={WHITE}
          />
          <rect
            x={ox + cx2 * cell + cell * 0.5}
            y={oy + cy2 * cell + cell * 0.5}
            width={cell * 2}
            height={cell * 2}
            fill={BLACK}
          />
        </g>
      ))}
      {dots.map(([col, row], i) => (
        <rect
          key={i}
          x={ox + col * cell}
          y={oy + row * cell}
          width={cell * 0.8}
          height={cell * 0.8}
          fill={BLACK}
        />
      ))}
    </g>
  )
}

const FlyerPreview = ({ values = {} }) => {
  const {
    title = '',
    location = '',
    ownerType = '',
    neighborhood = '',
    requirements = '',
    openUnit = '',
    facilities = '',
    propertyFeatures = '',
    rentAmount = '',
    servicesIncluded = '',
    phone = '',
    propertyPhoto = null,
  } = values

  let y = 270
  const sections = [
    { label: 'Requisitos', text: requirements },
    { label: 'Unidad Abierta', text: openUnit },
    { label: 'Facilidades', text: facilities },
    { label: 'Inmueble', text: propertyFeatures },
  ]

  return (
    <svg
      viewBox="0 0 1080 1400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
    >
      {/* ── Background ── */}
      <rect width="1080" height="1400" fill={WHITE} />

      {/* ── Clip paths ── */}
      <defs>
        <clipPath id="clip-top-photo">
          <circle cx="1062" cy="5" r="355" />
        </clipPath>
        <clipPath id="clip-building">
          <circle cx="878" cy="1218" r="188" />
        </clipPath>
      </defs>

      {/* ── Top-right black circle (property photo) ── */}
      {propertyPhoto ? (
        <image
          href={propertyPhoto}
          x="707"
          y="-350"
          width="710"
          height="710"
          clipPath="url(#clip-top-photo)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <circle cx="1062" cy="5" r="355" fill={BLACK} />
      )}

      {/* ── Orange title bar ── */}
      <rect x="0" y="28" width="792" height="88" rx="44" fill={ORANGE} />

      {/* ── Title on bar ── */}
      <text x="30" y="82" fill={WHITE} fontWeight="bold" fontSize="44" fontFamily={FONT}>
        {title}
      </text>
      <text x="30" y="112" fill={WHITE} fontSize="24" fontFamily={FONT}>
        {location}
      </text>

      {/* ── Owner type ── */}
      <text x="30" y="178" fill={ORANGE} fontWeight="bold" fontSize="26" fontFamily={FONT}>
        {ownerType}
      </text>

      {/* ── Neighborhood ── */}
      <text x="30" y="228" fill={BLACK} fontWeight="bold" fontSize="42" fontFamily={FONT}>
        {neighborhood}
      </text>

      {/* ── Text sections ── */}
      {sections.map(({ label, text }) => {
        const el = <Section key={label} label={label} text={text} y={y} />
        y += sectionHeight(text)
        return el
      })}

      {/* ── QR circle ── */}
      <circle cx="755" cy="490" r="142" fill={BLACK} />
      <text
        x="755"
        y="432"
        textAnchor="middle"
        fill={WHITE}
        fontWeight="bold"
        fontSize="32"
        fontFamily={FONT}
      >
        FOTOS
      </text>
      <rect x="668" y="447" width="174" height="174" fill={WHITE} rx="8" />
      <QRPlaceholder cx={755} cy={534} r={80} />

      {/* ── Orange circle bottom-left ── */}
      <circle cx="80" cy="1430" r="410" fill={ORANGE} />

      {/* ── Canon section ── */}
      <text x="30" y="1010" fill={WHITE} fontWeight="bold" fontSize="38" fontFamily={FONT}>
        CANON DE
      </text>
      <text x="30" y="1058" fill={WHITE} fontWeight="bold" fontSize="38" fontFamily={FONT}>
        ARRENDAMIENTO
      </text>
      <text x="30" y="1148" fill={WHITE} fontWeight="bold" fontSize="76" fontFamily={FONT}>
        {rentAmount}
      </text>
      <text x="30" y="1204" fill={WHITE} fontSize="26" fontFamily={FONT}>
        Servicios incluidos:
      </text>
      <text x="30" y="1238" fill={WHITE} fontSize="26" fontFamily={FONT}>
        {servicesIncluded}
      </text>

      {/* ── Building photo circle bottom-right ── */}
      <circle cx="878" cy="1218" r="200" fill="none" stroke={ORANGE} strokeWidth="14" />
      <circle cx="878" cy="1218" r="188" fill="#ccc" />
      <text x="878" y="1226" textAnchor="middle" fill="#999" fontSize="24" fontFamily={FONT}>
        Foto edificio
      </text>

      {/* ── Phone ── */}
      <text
        x="600"
        y="1348"
        textAnchor="middle"
        fill={WHITE}
        fontSize="30"
        fontWeight="bold"
        fontFamily={FONT}
      >
        {`📱 ${phone}`}
      </text>
    </svg>
  )
}

export default FlyerPreview
