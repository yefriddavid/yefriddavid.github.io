import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CFormCheck } from '@coreui/react'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { uploadImages } from 'src/services/facade/imageFacade'

export const EMPTY = {
  plate: '',
  brand: '',
  model: '',
  year: '',
  active: true,
  comment: '',
  photos: [],
}

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const VehicleForm = ({ initial, onSave, onCancel, saving, title, subtitle }) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  const active = watch('active') ?? true
  const [photos, setPhotos] = useState(initial?.photos ?? [])
  const photosInputRef = useRef()

  const handlePhotosChange = async (e) => {
    const handles = await uploadImages(e.target.files)
    setPhotos((prev) => [...prev, ...handles])
    e.target.value = ''
  }

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx))

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={handleSubmit((data) => onSave({ ...data, photos }))}
      saving={saving}
    >
      <StandardField label={t('taxis.vehicles.fields.plate')}>
        <input
          className={SF.input}
          placeholder="ABC-123"
          {...register('plate', { required: 'La placa es obligatoria' })}
        />
        {fieldError(errors.plate)}
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.brand')}>
        <input
          className={SF.input}
          placeholder="Renault"
          {...register('brand', { required: 'La marca es obligatoria' })}
        />
        {fieldError(errors.brand)}
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.model')}>
        <input className={SF.input} placeholder="Logan" {...register('model')} />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.year')}>
        <input className={SF.input} type="number" placeholder="2020" {...register('year')} />
      </StandardField>
      <StandardField label={t('taxis.vehicles.fields.status')}>
        <CFormCheck
          id={`active-${initial?.id || 'new'}`}
          checked={active !== false}
          onChange={(e) => setValue('active', e.target.checked)}
          label={
            active !== false
              ? t('taxis.vehicles.fields.active')
              : t('taxis.vehicles.fields.inactive')
          }
        />
      </StandardField>
      <StandardField label="Comentario">
        <input
          className={SF.input}
          placeholder="Observaciones opcionales"
          {...register('comment')}
        />
      </StandardField>
      <StandardField label="Fotos">
        <div className="master-photos-picker">
          {photos.length > 0 && (
            <div className="master-photos-picker__grid">
              {photos.map((p, i) => (
                <div key={i} className="master-photos-picker__thumb">
                  <img src={p} alt={`Foto ${i + 1}`} />
                  <button
                    type="button"
                    className="master-photos-picker__remove"
                    onClick={() => removePhoto(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={photosInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotosChange}
          />
          <button
            type="button"
            className="master-photo-picker__btn"
            onClick={() => photosInputRef.current?.click()}
          >
            + Agregar fotos
          </button>
        </div>
      </StandardField>
    </StandardForm>
  )
}

export default VehicleForm
