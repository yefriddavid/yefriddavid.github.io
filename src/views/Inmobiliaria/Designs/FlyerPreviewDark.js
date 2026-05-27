import React, { forwardRef, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

const FONT = 'Arial, Helvetica, sans-serif'
const TEAL = '#00cfb4'
const DARK = '#0d1117'
const DARK2 = '#161b22'
const WHITE = '#ffffff'

const SectionDark = ({ label, text, y, fontSize }) => {
  const lines = text ? text.split('\n').filter(Boolean) : []
  const labelSize = fontSize + 7
  const lineH = fontSize + 6
  return (
    <>
      <text x={40} y={y} fill={TEAL} fontSize={labelSize} fontWeight="bold" fontFamily={FONT}>
        {label}
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x={50}
          y={y + labelSize + 4 + i * lineH}
          fill="rgba(255,255,255,0.85)"
          fontSize={fontSize}
          fontFamily={FONT}
        >
          <tspan fill={TEAL}>{'▸ '}</tspan>
          {line}
        </text>
      ))}
    </>
  )
}

const sectionHeightDark = (text, fontSize) => {
  const lines = text ? text.split('\n').filter(Boolean).length : 0
  const labelSize = fontSize + 7
  const lineH = fontSize + 6
  return labelSize + 4 + lines * lineH + 14
}

const FlyerPreviewDark = forwardRef(({ values = {}, onPropertyDrag, onBuildingDrag }, ref) => {
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
    propertyPhotoX = 0,
    propertyPhotoY = 0,
    propertyPhotoSize = 1100,
    buildingPhoto = null,
    buildingPhotoX = 0,
    buildingPhotoY = 0,
    buildingPhotoSize = 700,
    photoLink = '',
    canonColor = '#000000',
    sectionFontSize = 17,
  } = values

  const secFS = Math.max(10, Math.min(30, Number(sectionFontSize) || 17))
  const propSize = Number(propertyPhotoSize) || 1100
  const bldgSize = Number(buildingPhotoSize) || 700

  // Property photo centered in hero (540, 241)
  const propX = 540 - propSize / 2 + Number(propertyPhotoX || 0)
  const propY = 241 - propSize / 2 + Number(propertyPhotoY || 0)
  // Building photo centered in its box (895, 1058)
  const bldgX = 895 - bldgSize / 2 + Number(buildingPhotoX || 0)
  const bldgY = 1058 - bldgSize / 2 + Number(buildingPhotoY || 0)

  const [qrDataUrl, setQrDataUrl] = useState(null)
  const propDragging = useRef(false)
  const bldgDragging = useRef(false)
  const lastDragPos = useRef({ x: 0, y: 0 })
  const [activeCircle, setActiveCircle] = useState(null)

  const startPropDrag = (e) => {
    if (!onPropertyDrag) return
    propDragging.current = true
    setActiveCircle('prop')
    lastDragPos.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
  const startBldgDrag = (e) => {
    if (!onBuildingDrag) return
    bldgDragging.current = true
    setActiveCircle('bldg')
    lastDragPos.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
  const handleSvgMove = (e) => {
    if (!propDragging.current && !bldgDragging.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const scale = 1080 / rect.width
    const dx = (e.clientX - lastDragPos.current.x) * scale
    const dy = (e.clientY - lastDragPos.current.y) * scale
    lastDragPos.current = { x: e.clientX, y: e.clientY }
    if (propDragging.current) onPropertyDrag(dx, dy)
    if (bldgDragging.current) onBuildingDrag(dx, dy)
  }
  const stopDrag = () => {
    propDragging.current = false
    bldgDragging.current = false
    setActiveCircle(null)
  }

  useEffect(() => {
    if (!photoLink) {
      setQrDataUrl(null)
      return
    }
    QRCode.toDataURL(photoLink, {
      margin: 1,
      width: 200,
      color: { dark: '#00cfb4', light: '#161b22' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [photoLink])

  // canonColor defaults to black — make it visible on dark bg
  const resolvedCanonColor = canonColor === '#000000' ? WHITE : canonColor

  const sections = [
    { label: 'Requisitos', text: requirements },
    { label: 'Sector', text: openUnit },
    { label: 'Facilidades', text: facilities },
    { label: 'Inmueble', text: propertyFeatures },
  ]

  let y = 610

  return (
    <svg
      viewBox="0 0 1080 1400"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: 8,
        overflow: 'hidden',
      }}
      overflow="hidden"
      onMouseMove={handleSvgMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* ── Base background ── */}
      <rect width="1080" height="1400" fill={DARK} />

      <defs>
        <clipPath id="clip-hero-dark">
          <rect x="0" y="0" width="1080" height="482" />
        </clipPath>
        <clipPath id="clip-bldg-dark">
          <rect x="740" y="916" width="310" height="285" rx="14" />
        </clipPath>
        <linearGradient id="hero-grad-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={DARK} stopOpacity="0" />
          <stop offset="50%" stopColor={DARK} stopOpacity="0.3" />
          <stop offset="100%" stopColor={DARK} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* ── Hero photo ── */}
      {propertyPhoto ? (
        <>
          <image
            href={propertyPhoto}
            x={propX}
            y={propY}
            width={propSize}
            height={propSize}
            clipPath="url(#clip-hero-dark)"
            preserveAspectRatio="xMidYMid slice"
          />
          {onPropertyDrag && (
            <rect
              x="0"
              y="0"
              width="1080"
              height="482"
              fill="none"
              pointerEvents="all"
              style={{ cursor: 'grab' }}
              onMouseDown={startPropDrag}
            />
          )}
        </>
      ) : (
        <rect x="0" y="0" width="1080" height="482" fill="#1a2035" />
      )}

      {/* gradient overlay on hero */}
      <rect
        x="0"
        y="0"
        width="1080"
        height="482"
        fill="url(#hero-grad-dark)"
        pointerEvents="none"
      />

      {/* ── Left teal accent bar ── */}
      <rect x="0" y="0" width="7" height="1400" fill={TEAL} />

      {/* ── Hero text overlay ── */}
      <text x="40" y="388" fill={TEAL} fontSize="26" fontWeight="bold" fontFamily={FONT}>
        {location}
      </text>
      <text x="40" y="450" fill={WHITE} fontSize="58" fontWeight="bold" fontFamily={FONT}>
        {ownerType}
      </text>

      {/* ── Title strip ── */}
      <rect x="0" y="482" width="1080" height="108" fill={DARK2} />
      <text x="40" y="534" fill={WHITE} fontSize="40" fontWeight="bold" fontFamily={FONT}>
        {title}
      </text>
      <text x="40" y="572" fill={TEAL} fontSize="24" fontFamily={FONT}>
        {neighborhood}
      </text>

      {/* ── Section separator ── */}
      <line x1="40" y1="596" x2="686" y2="596" stroke={TEAL} strokeWidth="1" opacity="0.25" />

      {/* ── Text sections (left column) ── */}
      {sections.map(({ label, text }) => {
        const el = <SectionDark key={label} label={label} text={text} y={y} fontSize={secFS} />
        y += sectionHeightDark(text, secFS)
        return el
      })}

      {/* ── QR code (right column) ── */}
      <rect
        x="740"
        y="592"
        width="310"
        height="305"
        rx="14"
        fill={DARK2}
        stroke={TEAL}
        strokeWidth="2"
      />
      <text
        x="895"
        y="626"
        textAnchor="middle"
        fill={TEAL}
        fontWeight="bold"
        fontSize="20"
        fontFamily={FONT}
      >
        FOTOS
      </text>
      <rect x="769" y="638" width="252" height="244" rx="6" fill={WHITE} />
      {qrDataUrl ? (
        <image href={qrDataUrl} x="773" y="642" width="244" height="236" />
      ) : (
        <text x="895" y="764" textAnchor="middle" fill="#555" fontSize="18" fontFamily={FONT}>
          sin link
        </text>
      )}

      {/* ── Building photo (right column) ── */}
      <rect
        x="740"
        y="916"
        width="310"
        height="285"
        rx="14"
        fill={DARK2}
        stroke={TEAL}
        strokeWidth="2"
      />
      {buildingPhoto ? (
        <>
          <image
            href={buildingPhoto}
            x={bldgX}
            y={bldgY}
            width={bldgSize}
            height={bldgSize}
            clipPath="url(#clip-bldg-dark)"
            preserveAspectRatio="xMidYMid slice"
          />
          {onBuildingDrag && (
            <rect
              x="740"
              y="916"
              width="310"
              height="285"
              fill="none"
              pointerEvents="all"
              style={{ cursor: 'grab' }}
              onMouseDown={startBldgDrag}
            />
          )}
        </>
      ) : (
        <text x="895" y="1062" textAnchor="middle" fill="#444" fontSize="22" fontFamily={FONT}>
          Foto edificio
        </text>
      )}

      {/* ── Canon section (left column, below sections) ── */}
      {(() => {
        const cy = Math.max(y + 20, 1090)
        return (
          <>
            <text
              x="40"
              y={cy}
              fill={resolvedCanonColor}
              fontWeight="bold"
              fontSize="28"
              fontFamily={FONT}
            >
              CANON DE ARRENDAMIENTO
            </text>
            <text
              x="40"
              y={cy + 94}
              fill={resolvedCanonColor}
              fontWeight="bold"
              fontSize="78"
              fontFamily={FONT}
            >
              {rentAmount}
            </text>
            {servicesIncluded && (
              <>
                <text
                  x="40"
                  y={cy + 152}
                  fill={resolvedCanonColor}
                  fontSize="24"
                  fontWeight="bold"
                  fontFamily={FONT}
                >
                  Servicios incluidos:
                </text>
                <text x="40" y={cy + 184} fill={resolvedCanonColor} fontSize="24" fontFamily={FONT}>
                  {servicesIncluded}
                </text>
              </>
            )}
          </>
        )
      })()}

      {/* ── Footer teal band ── */}
      <rect x="0" y="1314" width="1080" height="86" fill={TEAL} />
      {phone && (
        <text
          x="540"
          y="1370"
          textAnchor="middle"
          fill={DARK}
          fontSize="42"
          fontWeight="bold"
          fontFamily={FONT}
        >
          {`📱 ${phone}`}
        </text>
      )}

      {/* ── Drag crosshair guides ── */}
      {activeCircle &&
        (() => {
          const cx = activeCircle === 'prop' ? 540 : 895
          const cy = activeCircle === 'prop' ? 241 : 1058
          return (
            <>
              <line
                x1="0"
                y1={cy}
                x2="1080"
                y2={cy}
                stroke="rgba(0,207,180,0.55)"
                strokeWidth="2.5"
                strokeDasharray="14,8"
                pointerEvents="none"
              />
              <line
                x1={cx}
                y1="0"
                x2={cx}
                y2="1400"
                stroke="rgba(0,207,180,0.55)"
                strokeWidth="2.5"
                strokeDasharray="14,8"
                pointerEvents="none"
              />
              <circle
                cx={cx}
                cy={cy}
                r="10"
                fill="none"
                stroke="rgba(0,207,180,0.8)"
                strokeWidth="2"
                pointerEvents="none"
              />
            </>
          )
        })()}
    </svg>
  )
})

FlyerPreviewDark.displayName = 'FlyerPreviewDark'

export default FlyerPreviewDark
