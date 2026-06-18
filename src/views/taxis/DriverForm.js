import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
import { uploadImage } from 'src/services/facade/imageFacade'

export const EMPTY = {
  name: '',
  idNumber: '',
  phone: '',
  defaultAmount: '',
  defaultAmountSunday: '',
  defaultVehicle: '',
  active: true,
  startDate: '',
  endDate: '',
  comment: '',
  photo: null,
}

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 'var(--fs-xs)', color: '#b91c1c', marginTop: 2, display: 'block' }}>
      {err.message}
    </span>
  ) : null

const DriverForm = ({ initial, vehicles, onSave, onCancel, saving, title, subtitle }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initial })

  const active = watch('active') ?? true
  const [photo, setPhoto] = useState(initial?.photo ?? null)
  const photoInputRef = useRef()

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const handle = await uploadImage(file)
    setPhoto(handle)
  }

  return (
    <StandardForm
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      onSave={handleSubmit((data) => onSave({ ...data, photo }))}
      saving={saving}
    >
      <div className="master-section-label">Datos personales</div>
      <StandardField label="Nombre">
        <input
          className={SF.input}
          placeholder="Nombre completo"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {fieldError(errors.name)}
      </StandardField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <StandardField label="Cédula">
          <input
            className={SF.input}
            placeholder="123456789"
            {...register('idNumber', { required: 'La cédula es obligatoria' })}
          />
          {fieldError(errors.idNumber)}
        </StandardField>
        <StandardField label="Teléfono">
          <input className={SF.input} placeholder="300 000 0000" {...register('phone')} />
        </StandardField>
      </div>

      <div className="master-section-label">Liquidación por defecto</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
        <StandardField label="Liq. normal">
          <input
            className={SF.input}
            type="number"
            placeholder="85000"
            {...register('defaultAmount')}
          />
        </StandardField>
        <StandardField label="Liq. domingo">
          <input
            className={SF.input}
            type="number"
            placeholder="0"
            {...register('defaultAmountSunday')}
          />
        </StandardField>
        <StandardField label="Taxi por defecto">
          <select className={SF.select} {...register('defaultVehicle')}>
            <option value="">— Ninguno —</option>
            {(vehicles ?? []).map((v) => (
              <option key={v.id} value={v.plate}>
                {v.plate}
                {v.brand ? ` · ${v.brand}` : ''}
                {v.active === false ? ' (Inactivo)' : ''}
              </option>
            ))}
          </select>
        </StandardField>
      </div>

      <div className="master-section-label">Vigencia y estado</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
        <StandardField label="Fecha inicio">
          <input className={SF.input} type="date" {...register('startDate')} />
        </StandardField>
        <StandardField label="Fecha fin">
          <input className={SF.input} type="date" {...register('endDate')} />
        </StandardField>
        <StandardField label="Estado">
          <button
            type="button"
            onClick={() => setValue('active', !active)}
            className={`master-toggle-btn${active !== false ? ' master-toggle-btn--active' : ' master-toggle-btn--inactive'}`}
          >
            {active !== false ? '✓ Activo' : '✗ Inactivo'}
          </button>
        </StandardField>
      </div>

      <div className="master-section-label">Observaciones y foto</div>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0, alignItems: 'start' }}
      >
        <StandardField label="Comentario">
          <input
            className={SF.input}
            placeholder="Observaciones opcionales"
            {...register('comment')}
          />
        </StandardField>
        <StandardField label="Foto">
          <div className="master-photo-picker">
            {photo && (
              <div className="master-photo-picker__preview">
                <img src={photo} alt="Foto conductor" />
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <div className="master-photo-picker__actions">
              <button
                type="button"
                className="master-photo-picker__btn"
                onClick={() => photoInputRef.current?.click()}
              >
                {photo ? 'Cambiar' : '+ Foto'}
              </button>
              {photo && (
                <button
                  type="button"
                  className="master-photo-picker__btn master-photo-picker__btn--remove"
                  onClick={() => setPhoto(null)}
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
        </StandardField>
      </div>
    </StandardForm>
  )
}

export default DriverForm
