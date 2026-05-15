import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { CSpinner } from '@coreui/react'
import {
  cilPlus, cilTrash, cilPencil, cilChevronBottom, cilChevronRight,
  cilCopy, cilArrowTop, cilArrowBottom,
} from '@coreui/icons'
import * as actions from 'src/actions/domotica/domoticaCommandProfileActions'

const EMPTY_PROFILE = { name: '', description: '', deviceModel: '' }
const EMPTY_ITEM = { value: '', notes: '' }

const CommandProfilesPanel = () => {
  const dispatch = useDispatch()
  const { profiles, fetching, saving, profileItems, loadingItems } = useSelector(
    (s) => s.domoticaCommandProfile,
  )
  const dictionary = useSelector((s) => s.domoticaCommandDictionary.data)

  const [expanded, setExpanded] = useState(null)
  const [profileForm, setProfileForm] = useState(null)   // null | { mode:'create'|'edit', data }
  const [itemForm, setItemForm] = useState(null)          // null | { profileId, mode, data, editId }

  useEffect(() => {
    dispatch(actions.fetchProfilesRequest())
  }, [dispatch])

  const toggleProfile = (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!profileItems[id]) dispatch(actions.fetchItemsRequest({ profileId: id }))
  }

  const openCreateProfile = () =>
    setProfileForm({ mode: 'create', data: { ...EMPTY_PROFILE } })

  const openEditProfile = (profile) =>
    setProfileForm({ mode: 'edit', data: { ...profile } })

  const saveProfile = () => {
    const { mode, data } = profileForm
    if (!data.name.trim()) return
    if (mode === 'create') dispatch(actions.createProfileRequest(data))
    else dispatch(actions.updateProfileRequest(data))
    setProfileForm(null)
  }

  const deleteProfile = (id) => {
    if (!window.confirm('¿Eliminar este perfil y todos sus comandos?')) return
    dispatch(actions.deleteProfileRequest({ id }))
    if (expanded === id) setExpanded(null)
  }

  const openAddItem = (profileId) => {
    const items = profileItems[profileId] ?? []
    setItemForm({
      profileId,
      mode: 'create',
      editId: null,
      data: { ...EMPTY_ITEM, order: items.length },
    })
  }

  const openEditItem = (profileId, item) =>
    setItemForm({ profileId, mode: 'edit', editId: item.id, data: { ...item } })

  const saveItem = () => {
    const { profileId, mode, editId, data } = itemForm
    if (!data.value.trim()) return
    if (mode === 'create') {
      dispatch(actions.createItemRequest({ profileId, ...data }))
    } else {
      dispatch(actions.updateItemRequest({ id: editId, profileId, ...data }))
    }
    setItemForm(null)
  }

  const deleteItem = (profileId, id) =>
    dispatch(actions.deleteItemRequest({ id, profileId }))

  const moveItem = (profileId, index, dir) => {
    const items = [...(profileItems[profileId] ?? [])]
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const reordered = [...items]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const withOrder = reordered.map((it, i) => ({ ...it, order: i }))
    dispatch(actions.reorderItemsRequest({ profileId, items: withOrder }))
  }

  const copyToClipboard = (text) => navigator.clipboard.writeText(text).catch(() => {})

  const copyAllItems = (profileId) => {
    const items = profileItems[profileId] ?? []
    const text = items.map((i) => i.value).join('\n')
    copyToClipboard(text)
  }

  const getDictSuggestions = () => {
    if (!dictionary) return []
    return dictionary.map((d) => ({
      label: `${d.command} — ${d.name}`,
      value: d.writeFormat && d.writeFormat !== 'N/A' ? d.writeFormat : d.command,
    }))
  }

  if (fetching && !profiles) {
    return (
      <div className="cp-panel cp-panel--loading">
        <CSpinner size="sm" />
      </div>
    )
  }

  return (
    <div className="cp-panel">
      <div className="cp-panel__header">
        <span className="cp-panel__title">Perfiles</span>
        <button className="cp-panel__add-btn" onClick={openCreateProfile} title="Nuevo perfil">
          <CIcon icon={cilPlus} size="sm" />
        </button>
      </div>

      {/* ── Profile form ── */}
      {profileForm && (
        <div className="cp-form cp-form--profile">
          <input
            className="cp-form__input"
            placeholder="Nombre del perfil *"
            value={profileForm.data.name}
            autoFocus
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, data: { ...p.data, name: e.target.value } }))
            }
          />
          <input
            className="cp-form__input"
            placeholder="Modelo (ej: TT8750)"
            value={profileForm.data.deviceModel}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, data: { ...p.data, deviceModel: e.target.value } }))
            }
          />
          <input
            className="cp-form__input"
            placeholder="Descripción"
            value={profileForm.data.description}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))
            }
          />
          <div className="cp-form__actions">
            <button className="cp-form__btn cp-form__btn--cancel" onClick={() => setProfileForm(null)}>
              Cancelar
            </button>
            <button
              className="cp-form__btn cp-form__btn--save"
              onClick={saveProfile}
              disabled={saving || !profileForm.data.name.trim()}
            >
              {saving ? <CSpinner size="sm" /> : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* ── Profile list ── */}
      <div className="cp-panel__list">
        {(profiles ?? []).length === 0 && !profileForm && (
          <div className="cp-empty">
            Sin perfiles. Crea uno con el botón&nbsp;+
          </div>
        )}

        {(profiles ?? []).map((profile) => {
          const isExpanded = expanded === profile.id
          const items = profileItems[profile.id] ?? []
          const isLoadingItems = loadingItems[profile.id]

          return (
            <div key={profile.id} className={`cp-profile ${isExpanded ? 'cp-profile--open' : ''}`}>
              <div className="cp-profile__header" onClick={() => toggleProfile(profile.id)}>
                <CIcon
                  icon={isExpanded ? cilChevronBottom : cilChevronRight}
                  size="sm"
                  className="cp-profile__chevron"
                />
                <div className="cp-profile__info">
                  <span className="cp-profile__name">{profile.name}</span>
                  {profile.deviceModel && (
                    <span className="cp-profile__model">{profile.deviceModel}</span>
                  )}
                </div>
                <div className="cp-profile__btns" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="cp-icon-btn"
                    title="Editar perfil"
                    onClick={() => openEditProfile(profile)}
                  >
                    <CIcon icon={cilPencil} size="sm" />
                  </button>
                  <button
                    className="cp-icon-btn cp-icon-btn--danger"
                    title="Eliminar perfil"
                    onClick={() => deleteProfile(profile.id)}
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="cp-profile__body">
                  {profile.description && (
                    <p className="cp-profile__desc">{profile.description}</p>
                  )}

                  {isLoadingItems && (
                    <div className="cp-items__loading"><CSpinner size="sm" /></div>
                  )}

                  {!isLoadingItems && items.length > 0 && (
                    <ol className="cp-items">
                      {items.map((item, idx) => (
                        <li key={item.id} className="cp-item">
                          <div className="cp-item__top">
                            <code className="cp-item__value">{item.value}</code>
                            <div className="cp-item__actions">
                              <button
                                className="cp-icon-btn"
                                title="Mover arriba"
                                onClick={() => moveItem(profile.id, idx, -1)}
                                disabled={idx === 0}
                              >
                                <CIcon icon={cilArrowTop} size="sm" />
                              </button>
                              <button
                                className="cp-icon-btn"
                                title="Mover abajo"
                                onClick={() => moveItem(profile.id, idx, 1)}
                                disabled={idx === items.length - 1}
                              >
                                <CIcon icon={cilArrowBottom} size="sm" />
                              </button>
                              <button
                                className="cp-icon-btn"
                                title="Copiar"
                                onClick={() => copyToClipboard(item.value)}
                              >
                                <CIcon icon={cilCopy} size="sm" />
                              </button>
                              <button
                                className="cp-icon-btn"
                                title="Editar"
                                onClick={() => openEditItem(profile.id, item)}
                              >
                                <CIcon icon={cilPencil} size="sm" />
                              </button>
                              <button
                                className="cp-icon-btn cp-icon-btn--danger"
                                title="Eliminar"
                                onClick={() => deleteItem(profile.id, item.id)}
                              >
                                <CIcon icon={cilTrash} size="sm" />
                              </button>
                            </div>
                          </div>
                          {item.notes && <span className="cp-item__notes">{item.notes}</span>}
                        </li>
                      ))}
                    </ol>
                  )}

                  {!isLoadingItems && items.length === 0 && !itemForm && (
                    <div className="cp-empty cp-empty--sm">Sin comandos aún</div>
                  )}

                  {/* ── Item form ── */}
                  {itemForm?.profileId === profile.id && (
                    <div className="cp-form cp-form--item">
                      <div className="cp-form__row">
                        <select
                          className="cp-form__input cp-form__input--sm"
                          onChange={(e) => {
                            if (e.target.value)
                              setItemForm((p) => ({
                                ...p,
                                data: { ...p.data, value: e.target.value },
                              }))
                          }}
                          defaultValue=""
                        >
                          <option value="">← Desde diccionario (opcional)</option>
                          {getDictSuggestions().map((s, i) => (
                            <option key={i} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        className="cp-form__input cp-form__input--code"
                        placeholder="Comando AT completo *"
                        value={itemForm.data.value}
                        autoFocus
                        onChange={(e) =>
                          setItemForm((p) => ({ ...p, data: { ...p.data, value: e.target.value } }))
                        }
                      />
                      <input
                        className="cp-form__input cp-form__input--sm"
                        placeholder="Nota (opcional)"
                        value={itemForm.data.notes}
                        onChange={(e) =>
                          setItemForm((p) => ({ ...p, data: { ...p.data, notes: e.target.value } }))
                        }
                      />
                      <div className="cp-form__actions">
                        <button className="cp-form__btn cp-form__btn--cancel" onClick={() => setItemForm(null)}>
                          Cancelar
                        </button>
                        <button
                          className="cp-form__btn cp-form__btn--save"
                          onClick={saveItem}
                          disabled={saving || !itemForm.data.value.trim()}
                        >
                          {saving ? <CSpinner size="sm" /> : 'Agregar'}
                        </button>
                      </div>
                    </div>
                  )}

                  {!itemForm && (
                    <div className="cp-profile__footer">
                      {items.length > 1 && (
                        <button
                          className="cp-text-btn"
                          onClick={() => copyAllItems(profile.id)}
                        >
                          <CIcon icon={cilCopy} size="sm" /> Copiar todos
                        </button>
                      )}
                      <button
                        className="cp-text-btn cp-text-btn--primary"
                        onClick={() => openAddItem(profile.id)}
                      >
                        <CIcon icon={cilPlus} size="sm" /> Agregar comando
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CommandProfilesPanel
