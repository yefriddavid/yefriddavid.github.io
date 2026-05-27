import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { CButton, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilFullscreen, cilX, cilCopy, cilCheck } from '@coreui/icons'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/designActions'
import FlyerPreview from '../Designs/FlyerPreview'
import FlyerPreviewDark from '../Designs/FlyerPreviewDark'
import FlyerPreviewElegant from '../Designs/FlyerPreviewElegant'
import '../Designs/Designs.scss'

const EMPTY = {
  name: '',
  title: '',
  location: '',
  ownerType: '',
  neighborhood: '',
  requirements: '',
  openUnit: '',
  facilities: '',
  propertyFeatures: '',
  rentAmount: '',
  servicesIncluded: '',
  phone: '',
  sectionFontSize: 17,
  propertyPhoto: '',
  propertyPhotoX: 0,
  propertyPhotoY: 0,
  propertyPhotoSize: 1100,
  buildingPhoto: '',
  buildingPhotoX: 0,
  buildingPhotoY: 0,
  buildingPhotoSize: 700,
  photoLink: '',
  canonColor: '#000000',
  template: 'orange',
  observations: '',
}

const SVG_W = 1080
const SVG_H = 1400

const compressPhoto = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 900
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width)
          width = MAX
        } else {
          width = Math.round((width * MAX) / height)
          height = MAX
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = url
  })

const copyToClipboard = (svgEl) => {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('width', SVG_W)
  clone.setAttribute('height', SVG_H)
  const svgStr = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }))
  const blobPromise = new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = SVG_W
      canvas.height = SVG_H
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, SVG_W, SVG_H)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
  return navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })])
}

const downloadFlyer = (svgEl, format, name) => {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('width', SVG_W)
  clone.setAttribute('height', SVG_H)
  const svgStr = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = SVG_W
    canvas.height = SVG_H
    const ctx = canvas.getContext('2d')
    if (format !== 'png') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, SVG_W, SVG_H)
    }
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    const mime = format === 'png' ? 'image/png' : 'image/jpeg'
    const quality = format === 'png' ? undefined : 0.92
    const a = document.createElement('a')
    a.href = canvas.toDataURL(mime, quality)
    a.download = `${name || 'flyer'}.${format}`
    a.click()
  }
  img.src = url
}

const DesignEditorPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { current, loading, saving } = useSelector((s) => s.inmobiliariaDesign)

  const isNew = !id
  const svgRef = useRef(null)
  const photoInputRef = useRef(null)
  const buildingInputRef = useRef(null)
  const [zoom, setZoom] = useState(100)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY })

  const values = watch()

  useEffect(() => {
    if (id) {
      dispatch(actions.loadRequest({ id }))
    } else {
      dispatch(actions.clearDesign())
      reset(EMPTY)
    }
  }, [id, dispatch, reset])

  useEffect(() => {
    if (!isNew && current?.id === id) {
      reset(current)
    }
  }, [current, id, isNew, reset])

  const fieldError = (err) =>
    err ? (
      <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
        {err.message}
      </span>
    ) : null

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setValue('propertyPhoto', await compressPhoto(file))
  }

  const handleBuildingChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setValue('buildingPhoto', await compressPhoto(file))
  }

  const pasteFromClipboard = async (field) => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const file = new File([blob], 'pasted.jpg', { type: imageType })
          setValue(field, await compressPhoto(file))
          break
        }
      }
    } catch {
      // permission denied or no image in clipboard
    }
  }

  const onSave = (data) => {
    if (isNew) {
      dispatch(actions.createRequest({ ...data, navigate }))
    } else {
      dispatch(actions.updateRequest({ id, data }))
    }
  }

  const onSaveAndExit = (data) => {
    dispatch(actions.updateRequest({ id, data, navigate }))
  }

  const handlePropertyDrag = (dx, dy) => {
    setValue('propertyPhotoX', (getValues('propertyPhotoX') || 0) + dx)
    setValue('propertyPhotoY', (getValues('propertyPhotoY') || 0) + dy)
  }

  const handleBuildingDrag = (dx, dy) => {
    setValue('buildingPhotoX', (getValues('buildingPhotoX') || 0) + dx)
    setValue('buildingPhotoY', (getValues('buildingPhotoY') || 0) + dy)
  }

  const handleCopyClipboard = async () => {
    try {
      await copyToClipboard(svgRef.current)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (e) {
      console.error('clipboard write failed', e)
    }
  }

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  if (!isNew && loading) return <Spinner mode="section" />
  if (!isNew && !loading && !current) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <CButton
          color="secondary"
          variant="ghost"
          size="sm"
          onClick={() => navigate('/inmobiliaria/designs')}
        >
          <CIcon icon={cilArrowLeft} className="me-1" />
          Volver
        </CButton>
        <h5 style={{ margin: 0 }}>{isNew ? 'Nuevo diseño' : `Editando: ${current?.name ?? ''}`}</h5>
      </div>

      <CRow>
        {/* ── Form ── */}
        <CCol md={6}>
          <StandardForm
            title={isNew ? 'Datos del panfleto' : 'Editar panfleto'}
            onCancel={() => navigate('/inmobiliaria/designs')}
            onSave={handleSubmit(onSave)}
            saving={saving}
            saveLabel={isNew ? 'Crear' : 'Guardar'}
            cancelLabel="Cancelar"
            extraActions={
              !isNew ? (
                <button
                  className="payment-form__btn payment-form__btn--save"
                  style={{ marginRight: 4 }}
                  onClick={handleSubmit(onSaveAndExit)}
                  disabled={saving}
                >
                  {saving ? <Spinner size="sm" /> : 'Guardar y salir'}
                </button>
              ) : null
            }
          >
            <StandardField label="Nombre interno *">
              <input
                className={SF.input}
                placeholder="Ej: Apto Quinta Linda"
                {...register('name', { required: 'El nombre es obligatorio' })}
              />
              {fieldError(errors.name)}
            </StandardField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <StandardField label="Título principal *">
                <input
                  className={SF.input}
                  placeholder="APARTAMENTO EN ALQUILER"
                  {...register('title', { required: 'Requerido' })}
                />
                {fieldError(errors.title)}
              </StandardField>
              <StandardField label="Ubicación">
                <input
                  className={SF.input}
                  placeholder="MEDELLIN - BUENOS AIRES"
                  {...register('location')}
                />
              </StandardField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <StandardField label="Tipo propietario">
                <input
                  className={SF.input}
                  placeholder="DUEÑO DIRECTO"
                  {...register('ownerType')}
                />
              </StandardField>
              <StandardField label="Barrio / Sector">
                <input
                  className={SF.input}
                  placeholder="BARRIO QUINTA LINDA"
                  {...register('neighborhood')}
                />
              </StandardField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <StandardField label="Requisitos (uno por línea)">
                <textarea
                  className={SF.textarea}
                  rows={3}
                  placeholder={'Carta Laboral\nAlquiler con contrato'}
                  {...register('requirements')}
                />
              </StandardField>
              <StandardField label="Unidad Abierta (uno por línea)">
                <textarea
                  className={SF.textarea}
                  rows={3}
                  placeholder={'Áreas verdes\nParqueadero común'}
                  {...register('openUnit')}
                />
              </StandardField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <StandardField label="Facilidades (uno por línea)">
                <textarea
                  className={SF.textarea}
                  rows={4}
                  placeholder={'Tiendas, Ferreterías\nA 20m de la terminal'}
                  {...register('facilities')}
                />
              </StandardField>
              <StandardField label="Inmueble (uno por línea)">
                <textarea
                  className={SF.textarea}
                  rows={4}
                  placeholder={'Primer piso\n1 Habitación con baño\nSala/Comedor'}
                  {...register('propertyFeatures')}
                />
              </StandardField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 0 }}>
              <StandardField label="Canon de arrendamiento">
                <input className={SF.input} placeholder="950.000$" {...register('rentAmount')} />
              </StandardField>
              <StandardField label="Servicios incluidos">
                <input
                  className={SF.input}
                  placeholder="Luz, Gas"
                  {...register('servicesIncluded')}
                />
              </StandardField>
              <StandardField label="Color texto">
                <input
                  type="color"
                  style={{
                    width: '100%',
                    height: 38,
                    padding: 2,
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                  {...register('canonColor')}
                />
              </StandardField>
            </div>

            <StandardField label="Teléfono / WhatsApp">
              <input className={SF.input} placeholder="+57 305 291 61 22" {...register('phone')} />
            </StandardField>

            <StandardField label={`Tamaño texto secciones — ${values.sectionFontSize ?? 17}px`}>
              <input
                type="range"
                min={12}
                max={26}
                step={1}
                style={{ width: '100%' }}
                {...register('sectionFontSize', { valueAsNumber: true })}
              />
            </StandardField>

            <StandardField label="Link fotos (genera QR)">
              <input
                className={SF.input}
                placeholder="https://drive.google.com/..."
                {...register('photoLink')}
              />
            </StandardField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <StandardField label={`Foto propiedad — zoom ${values.propertyPhotoSize ?? 1100}`}>
                <div className="im-designs__photo-upload">
                  {values.propertyPhoto ? (
                    <img
                      src={values.propertyPhoto}
                      className="im-designs__photo-thumb"
                      alt="preview"
                    />
                  ) : (
                    <div className="im-designs__photo-placeholder">Sin foto</div>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="outline"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {values.propertyPhoto ? 'Cambiar' : 'Subir'}
                  </CButton>
                  <CButton
                    size="sm"
                    color="info"
                    variant="outline"
                    onClick={() => pasteFromClipboard('propertyPhoto')}
                  >
                    Pegar
                  </CButton>
                  {values.propertyPhoto && (
                    <>
                      <input
                        type="range"
                        min={200}
                        max={2200}
                        step={50}
                        style={{ width: 70 }}
                        title={`Zoom: ${values.propertyPhotoSize ?? 1100}`}
                        {...register('propertyPhotoSize', { valueAsNumber: true })}
                      />
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        onClick={() => {
                          setValue('propertyPhotoX', 0)
                          setValue('propertyPhotoY', 0)
                        }}
                      >
                        Centrar
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="ghost"
                        onClick={() => {
                          setValue('propertyPhoto', '')
                          setValue('propertyPhotoX', 0)
                          setValue('propertyPhotoY', 0)
                          setValue('propertyPhotoSize', 1100)
                        }}
                      >
                        Quitar
                      </CButton>
                    </>
                  )}
                </div>
              </StandardField>

              <StandardField label={`Foto edificio — zoom ${values.buildingPhotoSize ?? 700}`}>
                <div className="im-designs__photo-upload">
                  {values.buildingPhoto ? (
                    <img
                      src={values.buildingPhoto}
                      className="im-designs__photo-thumb"
                      alt="edificio"
                    />
                  ) : (
                    <div className="im-designs__photo-placeholder">Sin foto</div>
                  )}
                  <input
                    ref={buildingInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleBuildingChange}
                  />
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="outline"
                    onClick={() => buildingInputRef.current?.click()}
                  >
                    {values.buildingPhoto ? 'Cambiar' : 'Subir'}
                  </CButton>
                  <CButton
                    size="sm"
                    color="info"
                    variant="outline"
                    onClick={() => pasteFromClipboard('buildingPhoto')}
                  >
                    Pegar
                  </CButton>
                  {values.buildingPhoto && (
                    <>
                      <input
                        type="range"
                        min={100}
                        max={1200}
                        step={50}
                        style={{ width: 70 }}
                        title={`Zoom: ${values.buildingPhotoSize ?? 700}`}
                        {...register('buildingPhotoSize', { valueAsNumber: true })}
                      />
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        onClick={() => {
                          setValue('buildingPhotoX', 0)
                          setValue('buildingPhotoY', 0)
                        }}
                      >
                        Centrar
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="ghost"
                        onClick={() => {
                          setValue('buildingPhoto', '')
                          setValue('buildingPhotoX', 0)
                          setValue('buildingPhotoY', 0)
                          setValue('buildingPhotoSize', 700)
                        }}
                      >
                        Quitar
                      </CButton>
                    </>
                  )}
                </div>
              </StandardField>
            </div>
            <StandardField label="Observaciones">
              <textarea
                className={SF.textarea}
                rows={3}
                placeholder="Notas internas, no aparecen en el diseño"
                {...register('observations')}
              />
            </StandardField>
          </StandardForm>
        </CCol>

        {/* ── Live preview ── */}
        <CCol md={6}>
          <div className="im-designs__preview-col">
            {/* Canvas toolbar */}
            <div className="im-designs__canvas-toolbar">
              <span className="im-designs__canvas-label">Canvas</span>
              <select className="im-designs__template-select" {...register('template')}>
                <option value="orange">🟠 Naranja</option>
                <option value="dark">🌙 Nocturno</option>
                <option value="elegant">✨ Elegante</option>
              </select>
              <div className="im-designs__zoom-controls">
                <button
                  className="im-designs__canvas-btn"
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  disabled={zoom <= 50}
                  title="Reducir zoom"
                >
                  −
                </button>
                <button
                  className="im-designs__zoom-value"
                  onClick={() => setZoom(100)}
                  title="Restablecer al 100%"
                >
                  {zoom}%
                </button>
                <button
                  className="im-designs__canvas-btn"
                  onClick={() => setZoom((z) => Math.min(200, z + 25))}
                  disabled={zoom >= 200}
                  title="Ampliar zoom"
                >
                  +
                </button>
              </div>
              <div className="im-designs__canvas-actions">
                <button
                  className={`im-designs__canvas-btn${copied ? ' im-designs__canvas-btn--success' : ''}`}
                  onClick={handleCopyClipboard}
                  title="Copiar como imagen"
                >
                  <CIcon icon={copied ? cilCheck : cilCopy} />
                </button>
                <button
                  className="im-designs__canvas-btn"
                  onClick={() => setFullscreen(true)}
                  title="Pantalla completa (Esc para cerrar)"
                >
                  <CIcon icon={cilFullscreen} />
                </button>
              </div>
            </div>

            {/* Flyer */}
            <div
              className="im-designs__preview-wrap"
              style={{ maxWidth: `${Math.round((560 * zoom) / 100)}px` }}
            >
              {values.template === 'dark' ? (
                <FlyerPreviewDark
                  ref={svgRef}
                  values={values}
                  onPropertyDrag={handlePropertyDrag}
                  onBuildingDrag={handleBuildingDrag}
                />
              ) : values.template === 'elegant' ? (
                <FlyerPreviewElegant
                  ref={svgRef}
                  values={values}
                  onPropertyDrag={handlePropertyDrag}
                  onBuildingDrag={handleBuildingDrag}
                />
              ) : (
                <FlyerPreview
                  ref={svgRef}
                  values={values}
                  onPropertyDrag={handlePropertyDrag}
                  onBuildingDrag={handleBuildingDrag}
                />
              )}
            </div>

            {/* Download bar */}
            <div className="im-designs__download-bar">
              <span className="im-designs__download-label">Descargar:</span>
              {['png', 'jpg', 'jpeg'].map((fmt) => (
                <CButton
                  key={fmt}
                  size="sm"
                  color="secondary"
                  variant="outline"
                  onClick={() => downloadFlyer(svgRef.current, fmt, values.name)}
                >
                  .{fmt.toUpperCase()}
                </CButton>
              ))}
            </div>
          </div>

          {/* Fullscreen overlay */}
          {fullscreen && (
            <div className="im-designs__fullscreen-overlay" onClick={() => setFullscreen(false)}>
              <div className="im-designs__fullscreen-inner" onClick={(e) => e.stopPropagation()}>
                <button
                  className="im-designs__fullscreen-close"
                  onClick={() => setFullscreen(false)}
                >
                  <CIcon icon={cilX} />
                </button>
                {values.template === 'dark' ? (
                  <FlyerPreviewDark
                    values={values}
                    onPropertyDrag={handlePropertyDrag}
                    onBuildingDrag={handleBuildingDrag}
                  />
                ) : values.template === 'elegant' ? (
                  <FlyerPreviewElegant
                    values={values}
                    onPropertyDrag={handlePropertyDrag}
                    onBuildingDrag={handleBuildingDrag}
                  />
                ) : (
                  <FlyerPreview
                    values={values}
                    onPropertyDrag={handlePropertyDrag}
                    onBuildingDrag={handleBuildingDrag}
                  />
                )}
              </div>
            </div>
          )}
        </CCol>
      </CRow>
    </div>
  )
}

export default DesignEditorPage
