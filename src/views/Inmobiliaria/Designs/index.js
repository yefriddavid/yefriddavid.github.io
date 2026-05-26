import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { CButton, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow } from 'devextreme-react/data-grid'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/inmobiliaria/designActions'
import FlyerPreview from './FlyerPreview'
import './Designs.scss'

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
  propertyPhoto: '',
}

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

const DesignEditor = ({ initial, onSave, onCancel, saving }) => {
  const photoInputRef = useRef(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: initial ?? EMPTY })

  const values = watch()

  const fieldError = (err) =>
    err ? (
      <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
        {err.message}
      </span>
    ) : null

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await compressPhoto(file)
    setValue('propertyPhoto', b64)
  }

  return (
    <CRow>
      {/* ── Form ── */}
      <CCol md={5}>
        <StandardForm
          title={initial?.id ? 'Editar diseño' : 'Nuevo diseño'}
          onCancel={onCancel}
          onSave={handleSubmit(onSave)}
          saving={saving}
          saveLabel={initial?.id ? 'Guardar' : 'Crear'}
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
              <input className={SF.input} placeholder="DUEÑO DIRECTO" {...register('ownerType')} />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
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
          </div>

          <StandardField label="Teléfono / WhatsApp">
            <input className={SF.input} placeholder="+57 305 291 61 22" {...register('phone')} />
          </StandardField>

          <StandardField label="Foto de la propiedad (círculo superior)">
            <div className="im-designs__photo-upload">
              {values.propertyPhoto ? (
                <img src={values.propertyPhoto} className="im-designs__photo-thumb" alt="preview" />
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
                {values.propertyPhoto ? 'Cambiar foto' : 'Subir foto'}
              </CButton>
              {values.propertyPhoto && (
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  onClick={() => setValue('propertyPhoto', '')}
                >
                  Quitar
                </CButton>
              )}
            </div>
          </StandardField>
        </StandardForm>
      </CCol>

      {/* ── Live preview ── */}
      <CCol md={7}>
        <div className="im-designs__preview-col">
          <div className="im-designs__preview-label">Vista previa</div>
          <div className="im-designs__preview-wrap">
            <FlyerPreview values={values} />
          </div>
        </div>
      </CCol>
    </CRow>
  )
}

const Designs = () => {
  const dispatch = useDispatch()
  const { list, fetching, saving } = useSelector((s) => s.inmobiliariaDesign)
  const [mode, setMode] = useState(null)
  const [editorKey, setEditorKey] = useState(0)
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleNew = () => {
    setEditTarget(null)
    setEditorKey((k) => k + 1)
    setMode('new')
  }

  const handleEdit = (row) => {
    setEditTarget(row)
    setEditorKey((k) => k + 1)
    setMode('edit')
  }

  const handleCancel = () => {
    setMode(null)
    setEditTarget(null)
  }

  const handleSave = (data) => {
    if (editTarget?.id) {
      dispatch(actions.updateRequest({ id: editTarget.id, data }))
    } else {
      dispatch(actions.createRequest(data))
    }
    setMode(null)
    setEditTarget(null)
  }

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.name}"?`)) {
      dispatch(actions.deleteRequest({ id: row.id }))
    }
  }

  return (
    <div className="im-designs">
      <div className="im-designs__toolbar">
        <h5 style={{ margin: 0 }}>Diseños de panfletos</h5>
        <CButton color="primary" size="sm" onClick={handleNew}>
          <CIcon icon={cilPlus} className="me-1" />
          Nuevo diseño
        </CButton>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : (
        <StandardGrid dataSource={list ?? []} keyExpr="id">
          <FilterRow visible />
          <Paging defaultPageSize={15} />
          <Column dataField="name" caption="Nombre" />
          <Column dataField="neighborhood" caption="Barrio" />
          <Column dataField="rentAmount" caption="Canon" width={130} />
          <Column dataField="phone" caption="Teléfono" width={160} />
          <Column
            caption="Acciones"
            width={100}
            cellRender={({ data }) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <CButton
                  size="sm"
                  color="primary"
                  variant="ghost"
                  title="Editar"
                  onClick={() => handleEdit(data)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  title="Eliminar"
                  onClick={() => handleDelete(data)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </div>
            )}
          />
        </StandardGrid>
      )}

      {mode && (
        <div className="im-designs__editor">
          <DesignEditor
            key={editorKey}
            initial={editTarget}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        </div>
      )}
    </div>
  )
}

export default Designs
