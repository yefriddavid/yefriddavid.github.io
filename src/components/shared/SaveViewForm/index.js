import React from 'react'
import { useForm } from 'react-hook-form'
import './SaveViewForm.scss'

const SaveViewForm = ({ onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { name: '' } })

  return (
    <form className="save-view-form" onSubmit={handleSubmit(({ name }) => onSave(name.trim()))}>
      <input
        className="save-view-form__input"
        placeholder="Nombre de la vista"
        {...register('name', { required: 'Ponele un nombre' })}
      />
      <button type="submit" className="save-view-form__save-btn">
        Guardar vista actual
      </button>
      {errors.name && <span className="save-view-form__error">{errors.name.message}</span>}
    </form>
  )
}

export default SaveViewForm
