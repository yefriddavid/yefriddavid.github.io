import React, { forwardRef, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

const FONT = 'Arial, Helvetica, sans-serif'
const ORANGE = '#F07820'
const BLACK = '#1a1a1a'
const WHITE = '#ffffff'

const Section = ({ label, text, y, fontSize }) => {
  const lines = text ? text.split('\n').filter(Boolean) : []
  const labelSize = fontSize + 9
  const lineH = fontSize + 7
  return (
    <>
      <text x={30} y={y} fill={BLACK} fontSize={labelSize} fontWeight="bold" fontFamily={FONT}>
        {label}
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x={40}
          y={y + labelSize + 4 + i * lineH}
          fill="#444"
          fontSize={fontSize}
          fontFamily={FONT}
        >
          <tspan fill={ORANGE}>{'• '}</tspan>
          {line}
        </text>
      ))}
    </>
  )
}

const sectionHeight = (text, fontSize) => {
  const lines = text ? text.split('\n').filter(Boolean).length : 0
  const labelSize = fontSize + 9
  const lineH = fontSize + 7
  return labelSize + 4 + lines * lineH + 14
}

const FlyerPreview = forwardRef(({ values = {}, onPropertyDrag, onBuildingDrag }, ref) => {
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
  const propX = 1062 - propSize / 2 + Number(propertyPhotoX || 0)
  const propY = 5 - propSize / 2 + Number(propertyPhotoY || 0)
  const bldgX = 878 - bldgSize / 2 + Number(buildingPhotoX || 0)
  const bldgY = 960 - bldgSize / 2 + Number(buildingPhotoY || 0)

  const [qrDataUrl, setQrDataUrl] = useState(null)

  const propDragging = useRef(false)
  const bldgDragging = useRef(false)
  const lastDragPos = useRef({ x: 0, y: 0 })

  const startPropDrag = (e) => {
    if (!onPropertyDrag) return
    propDragging.current = true
    lastDragPos.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
  const startBldgDrag = (e) => {
    if (!onBuildingDrag) return
    bldgDragging.current = true
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
  }

  useEffect(() => {
    if (!photoLink) {
      setQrDataUrl(null)
      return
    }
    QRCode.toDataURL(photoLink, {
      margin: 1,
      width: 200,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [photoLink])

  let y = 330
  const sections = [
    { label: 'Requisitos', text: requirements },
    { label: 'Sector', text: openUnit },
    { label: 'Facilidades', text: facilities },
    { label: 'Inmueble', text: propertyFeatures },
  ]

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
      <rect width="1080" height="1400" fill={WHITE} />

      <defs>
        <clipPath id="clip-top-photo">
          <circle cx="1062" cy="5" r="355" />
        </clipPath>
        <clipPath id="clip-building">
          <circle cx="878" cy="960" r="188" />
        </clipPath>
      </defs>

      {/* ── Top-right circle: property photo or black fill ── */}
      {propertyPhoto ? (
        <>
          <image
            href={propertyPhoto}
            x={propX}
            y={propY}
            width={propSize}
            height={propSize}
            clipPath="url(#clip-top-photo)"
            preserveAspectRatio="xMidYMid slice"
          />
          {onPropertyDrag && (
            <circle
              cx="1062"
              cy="5"
              r="355"
              fill="none"
              pointerEvents="all"
              style={{ cursor: 'grab' }}
              onMouseDown={startPropDrag}
            />
          )}
        </>
      ) : (
        <circle cx="1062" cy="5" r="355" fill={BLACK} />
      )}

      {/* ── Orange title bar — square left, rounded right ── */}
      <path
        d="M 0 28 L 774 28 A 18 18 0 0 1 792 46 L 792 130 A 18 18 0 0 1 774 148 L 0 148 Z"
        fill={ORANGE}
      />
      <text x="30" y="82" fill={BLACK} fontWeight="bold" fontSize="44" fontFamily={FONT}>
        {title}
      </text>
      <text x="30" y="116" fill={WHITE} fontSize="36" fontWeight="bold" fontFamily={FONT}>
        {location}
      </text>

      {/* ── Owner type + neighborhood ── */}
      <text x="30" y="212" fill={ORANGE} fontWeight="bold" fontSize="62" fontFamily={FONT}>
        {ownerType}
      </text>
      <text x="30" y="280" fill={BLACK} fontWeight="bold" fontSize="42" fontFamily={FONT}>
        {neighborhood}
      </text>

      {/* ── Text sections ── */}
      {sections.map(({ label, text }) => {
        const el = <Section key={label} label={label} text={text} y={y} fontSize={secFS} />
        y += sectionHeight(text, secFS)
        return el
      })}

      {/* ── QR circle ── */}
      <circle cx="755" cy="490" r="170" fill={BLACK} />
      <text
        x="755"
        y="401"
        textAnchor="middle"
        fill={WHITE}
        fontWeight="bold"
        fontSize="32"
        fontFamily={FONT}
      >
        FOTOS
      </text>
      <rect x="655" y="411" width="200" height="200" fill={WHITE} rx="8" />
      {qrDataUrl ? (
        <image href={qrDataUrl} x="659" y="415" width="192" height="192" />
      ) : (
        <text x="755" y="518" textAnchor="middle" fill="#aaa" fontSize="18" fontFamily={FONT}>
          sin link
        </text>
      )}

      {/* ── Orange circle bottom-left ── */}
      <circle cx="80" cy="1430" r="410" fill={ORANGE} />

      {/* ── Canon section ── */}
      <text x="30" y="1115" fill={canonColor} fontWeight="bold" fontSize="38" fontFamily={FONT}>
        CANON DE
      </text>
      <text x="30" y="1163" fill={canonColor} fontWeight="bold" fontSize="38" fontFamily={FONT}>
        ARRENDAMIENTO
      </text>
      <text x="30" y="1253" fill={canonColor} fontWeight="bold" fontSize="76" fontFamily={FONT}>
        {rentAmount}
      </text>
      {servicesIncluded && (
        <>
          <text x="30" y="1309" fill={canonColor} fontSize="26" fontWeight="bold" fontFamily={FONT}>
            Servicios incluidos:
          </text>
          <text x="30" y="1343" fill={canonColor} fontSize="26" fontWeight="bold" fontFamily={FONT}>
            {servicesIncluded}
          </text>
        </>
      )}

      {/* ── Building photo circle bottom-right ── */}
      <circle cx="878" cy="960" r="200" fill="transparent" stroke={ORANGE} strokeWidth="14" />
      {buildingPhoto ? (
        <>
          <image
            href={buildingPhoto}
            x={bldgX}
            y={bldgY}
            width={bldgSize}
            height={bldgSize}
            clipPath="url(#clip-building)"
            preserveAspectRatio="xMidYMid slice"
          />
          {onBuildingDrag && (
            <circle
              cx="878"
              cy="960"
              r="188"
              fill="none"
              pointerEvents="all"
              style={{ cursor: 'grab' }}
              onMouseDown={startBldgDrag}
            />
          )}
        </>
      ) : (
        <>
          <circle cx="878" cy="960" r="188" fill="#ccc" />
          <text x="878" y="968" textAnchor="middle" fill="#999" fontSize="24" fontFamily={FONT}>
            Foto edificio
          </text>
        </>
      )}

      {/* ── Phone decorative rectangles ── */}
      <rect
        x="740"
        y="1306"
        width="460"
        height="68"
        rx="14"
        fill="none"
        stroke="#F5C800"
        strokeWidth="10"
      />
      <rect
        x="756"
        y="1274"
        width="440"
        height="62"
        rx="12"
        fill="none"
        stroke={BLACK}
        strokeWidth="10"
      />

      {/* ── Phone ── */}
      {phone && (
        <text
          x="780"
          y="1248"
          textAnchor="middle"
          fill={ORANGE}
          fontSize="54"
          fontWeight="bold"
          fontFamily={FONT}
        >
          {`📱 ${phone}`}
        </text>
      )}
    </svg>
  )
})

FlyerPreview.displayName = 'FlyerPreview'

export default FlyerPreview
