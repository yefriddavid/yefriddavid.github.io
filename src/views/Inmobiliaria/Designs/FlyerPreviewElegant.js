import React, { forwardRef, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

const FONT = 'Arial, Helvetica, sans-serif'
const INDIGO = '#0e0c1e'
const INDIGO2 = '#1a1635'
const WHITE = '#ffffff'

const SectionElegant = ({ label, text, y, fontSize, accent }) => {
  const lines = text ? text.split('\n').filter(Boolean) : []
  const labelSize = fontSize + 7
  const lineH = fontSize + 6
  return (
    <>
      <rect x={40} y={y - labelSize + 4} width="3" height={labelSize - 4} fill={accent} />
      <text x={50} y={y} fill={WHITE} fontSize={labelSize} fontWeight="bold" fontFamily={FONT}>
        {label}
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x={54}
          y={y + labelSize + 4 + i * lineH}
          fill="rgba(255,255,255,0.78)"
          fontSize={fontSize}
          fontFamily={FONT}
        >
          <tspan fill={accent}>{'◆ '}</tspan>
          {line}
        </text>
      ))}
    </>
  )
}

const sectionHeightElegant = (text, fontSize) => {
  const lines = text ? text.split('\n').filter(Boolean).length : 0
  const labelSize = fontSize + 7
  const lineH = fontSize + 6
  return labelSize + 4 + lines * lineH + 16
}

const FlyerPreviewElegant = forwardRef(({ values = {}, onPropertyDrag, onBuildingDrag }, ref) => {
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
    elegantAccentColor = '#e8b84b',
    sectionFontSize = 17,
  } = values

  const accent = elegantAccentColor || '#e8b84b'

  const secFS = Math.max(10, Math.min(30, Number(sectionFontSize) || 17))
  const propSize = Number(propertyPhotoSize) || 1100
  const bldgSize = Number(buildingPhotoSize) || 700

  // Property photo centered in hero (540, 210)
  const propX = 540 - propSize / 2 + Number(propertyPhotoX || 0)
  const propY = 210 - propSize / 2 + Number(propertyPhotoY || 0)
  // Building photo centered in its box (872, 894)
  const bldgX = 872 - bldgSize / 2 + Number(buildingPhotoX || 0)
  const bldgY = 894 - bldgSize / 2 + Number(buildingPhotoY || 0)

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
      color: { dark: accent, light: '#1a1635' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [photoLink, accent])

  const resolvedCanonColor = canonColor === '#000000' ? accent : canonColor

  const sections = [
    { label: 'Requisitos', text: requirements },
    { label: 'Sector', text: openUnit },
    { label: 'Facilidades', text: facilities },
    { label: 'Inmueble', text: propertyFeatures },
  ]

  let y = 638

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
      <rect width="1080" height="1400" fill={INDIGO} />

      <defs>
        {/* Hero: diagonal cut at bottom (left y=428, right y=372) */}
        <clipPath id="clip-hero-elegant">
          <polygon points="0,0 1080,0 1080,372 0,428" />
        </clipPath>
        <clipPath id="clip-bldg-elegant">
          <rect x="702" y="755" width="340" height="285" rx="14" />
        </clipPath>

        {/* Vertical gradient on hero */}
        <linearGradient id="hero-vgrad-elegant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={INDIGO} stopOpacity="0" />
          <stop offset="45%" stopColor={INDIGO} stopOpacity="0.15" />
          <stop offset="82%" stopColor={INDIGO} stopOpacity="0.72" />
          <stop offset="100%" stopColor={INDIGO} stopOpacity="1" />
        </linearGradient>
        {/* Horizontal gradient on hero left edge */}
        <linearGradient id="hero-hgrad-elegant" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={INDIGO} stopOpacity="0.55" />
          <stop offset="28%" stopColor={INDIGO} stopOpacity="0" />
        </linearGradient>
        {/* Gold separator: fades right */}
        <linearGradient id="sep-grad-elegant" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="75%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── Top-right corner gold accent triangles ── */}
      <polygon points="1000,0 1080,0 1080,90" fill={accent} opacity="0.12" />
      <polygon points="1040,0 1080,0 1080,46" fill={accent} opacity="0.18" />

      {/* ── Hero photo ── */}
      {propertyPhoto ? (
        <>
          <image
            href={propertyPhoto}
            x={propX}
            y={propY}
            width={propSize}
            height={propSize}
            clipPath="url(#clip-hero-elegant)"
            preserveAspectRatio="xMidYMid slice"
          />
          {onPropertyDrag && (
            <polygon
              points="0,0 1080,0 1080,372 0,428"
              fill="none"
              pointerEvents="all"
              style={{ cursor: 'grab' }}
              onMouseDown={startPropDrag}
            />
          )}
        </>
      ) : (
        <polygon points="0,0 1080,0 1080,372 0,428" fill={INDIGO2} />
      )}

      {/* gradient overlays on hero */}
      <polygon
        points="0,0 1080,0 1080,372 0,428"
        fill="url(#hero-vgrad-elegant)"
        pointerEvents="none"
      />
      <polygon
        points="0,0 1080,0 1080,372 0,428"
        fill="url(#hero-hgrad-elegant)"
        pointerEvents="none"
      />

      {/* ── Neighborhood overlaid on hero bottom ── */}
      <text x="50" y="400" fill={WHITE} fontSize="28" fontWeight="bold" fontFamily={FONT}>
        {neighborhood}
      </text>

      {/* ── Gold diagonal band at hero bottom ── */}
      <polygon points="0,418 1080,368 1080,386 0,436" fill={accent} />

      {/* ── Bottom-left corner accent ── */}
      <polygon points="0,1340 0,1400 62,1400" fill={accent} opacity="0.22" />

      {/* ── Gold ornament + ownerType ── */}
      <rect x="50" y="464" width="72" height="3" fill={accent} />
      <text x="50" y="518" fill={WHITE} fontSize="60" fontWeight="bold" fontFamily={FONT}>
        {ownerType}
      </text>
      <text x="50" y="562" fill={accent} fontSize="34" fontWeight="bold" fontFamily={FONT}>
        {title}
      </text>
      <text x="50" y="592" fill="rgba(255,255,255,0.55)" fontSize="22" fontFamily={FONT}>
        {location}
      </text>

      {/* ── Gold gradient separator ── */}
      <rect x="50" y="606" width="580" height="2" fill="url(#sep-grad-elegant)" />

      {/* ── Text sections (left column) ── */}
      {sections.map(({ label, text }) => {
        const el = <SectionElegant key={label} label={label} text={text} y={y} fontSize={secFS} accent={accent} />
        y += sectionHeightElegant(text, secFS)
        return el
      })}

      {/* ── QR code (right column) ── */}
      <rect
        x="702"
        y="446"
        width="340"
        height="295"
        rx="14"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
      />
      <text
        x="872"
        y="482"
        textAnchor="middle"
        fill={accent}
        fontWeight="bold"
        fontSize="17"
        fontFamily={FONT}
        letterSpacing="4"
      >
        FOTOS
      </text>
      <line x1="832" y1="489" x2="912" y2="489" stroke={accent} strokeWidth="1" opacity="0.45" />
      <rect x="740" y="498" width="264" height="233" rx="6" fill={WHITE} />
      {qrDataUrl ? (
        <image href={qrDataUrl} x="744" y="502" width="256" height="225" />
      ) : (
        <text x="872" y="618" textAnchor="middle" fill="#666" fontSize="18" fontFamily={FONT}>
          sin link
        </text>
      )}

      {/* ── Building photo (right column) ── */}
      <rect
        x="702"
        y="755"
        width="340"
        height="285"
        rx="14"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
      />
      {buildingPhoto ? (
        <>
          <image
            href={buildingPhoto}
            x={bldgX}
            y={bldgY}
            width={bldgSize}
            height={bldgSize}
            clipPath="url(#clip-bldg-elegant)"
            preserveAspectRatio="xMidYMid slice"
          />
          {onBuildingDrag && (
            <rect
              x="702"
              y="755"
              width="340"
              height="285"
              fill="none"
              pointerEvents="all"
              style={{ cursor: 'grab' }}
              onMouseDown={startBldgDrag}
            />
          )}
        </>
      ) : (
        <text x="872" y="900" textAnchor="middle" fill="#3a3050" fontSize="22" fontFamily={FONT}>
          Foto edificio
        </text>
      )}

      {/* ── Canon section (left column, after sections) ── */}
      {(() => {
        const cy = Math.max(y + 18, 1080)
        return (
          <>
            <rect x="50" y={cy - 2} width="3" height="80" fill={accent} opacity="0.6" />
            <text
              x="62"
              y={cy + 26}
              fill="rgba(255,255,255,0.55)"
              fontWeight="bold"
              fontSize="22"
              fontFamily={FONT}
            >
              CANON DE ARRENDAMIENTO
            </text>
            <text
              x="50"
              y={cy + 116}
              fill={resolvedCanonColor}
              fontWeight="bold"
              fontSize="80"
              fontFamily={FONT}
            >
              {rentAmount}
            </text>
            {servicesIncluded && (
              <>
                <text
                  x="50"
                  y={cy + 170}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="23"
                  fontFamily={FONT}
                >
                  Servicios incluidos: {servicesIncluded}
                </text>
              </>
            )}
          </>
        )
      })()}

      {/* ── Gold footer band ── */}
      <rect x="0" y="1314" width="1080" height="86" fill={accent} />
      {phone && (
        <text
          x="540"
          y="1370"
          textAnchor="middle"
          fill={INDIGO}
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
          const cx = activeCircle === 'prop' ? 540 : 872
          const cy = activeCircle === 'prop' ? 210 : 894
          return (
            <>
              <line
                x1="0"
                y1={cy}
                x2="1080"
                y2={cy}
                stroke="rgba(232,184,75,0.6)"
                strokeWidth="2.5"
                strokeDasharray="14,8"
                pointerEvents="none"
              />
              <line
                x1={cx}
                y1="0"
                x2={cx}
                y2="1400"
                stroke="rgba(232,184,75,0.6)"
                strokeWidth="2.5"
                strokeDasharray="14,8"
                pointerEvents="none"
              />
              <circle
                cx={cx}
                cy={cy}
                r="10"
                fill="none"
                stroke="rgba(232,184,75,0.85)"
                strokeWidth="2"
                pointerEvents="none"
              />
            </>
          )
        })()}
    </svg>
  )
})

FlyerPreviewElegant.displayName = 'FlyerPreviewElegant'

export default FlyerPreviewElegant
