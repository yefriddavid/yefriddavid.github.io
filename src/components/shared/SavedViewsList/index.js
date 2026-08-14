import React from 'react'
import './SavedViewsList.scss'

const SavedViewsList = ({
  views,
  onLoad,
  onDelete,
  onUpdate,
  emptyText = 'Todavía no guardaste ninguna vista.',
}) => {
  if (views.length === 0) return <p className="saved-views-list__empty">{emptyText}</p>

  return (
    <ul className="saved-views-list">
      {views.map((v) => (
        <li key={v.id} className="saved-views-list__item">
          <button type="button" className="saved-views-list__link" onClick={() => onLoad(v)}>
            {v.name}
          </button>
          {onUpdate && (
            <button
              type="button"
              className="saved-views-list__edit"
              title="Actualizar vista con los filtros actuales"
              onClick={() => onUpdate(v.id)}
            >
              ✏️
            </button>
          )}
          <button
            type="button"
            className="saved-views-list__delete"
            title="Eliminar vista"
            onClick={() => onDelete(v.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}

export default SavedViewsList
