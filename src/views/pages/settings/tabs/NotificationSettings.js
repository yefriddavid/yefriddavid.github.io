import React, { useEffect, useState } from 'react'
import { CAlert, CButton, CListGroup, CListGroupItem, CSpinner, CBadge } from '@coreui/react'
import { cilBell } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  getNotifyHours,
  saveNotifyHours,
  DEFAULT_HOURS,
} from 'src/services/providers/indexeddb/picoPlacaConfig'

function getPermissionBadge(permission) {
  if (permission === 'granted') return <CBadge color="success">Concedido</CBadge>
  if (permission === 'denied') return <CBadge color="danger">Denegado</CBadge>
  return <CBadge color="warning">Pendiente</CBadge>
}

function getSwStatusBadge(registered) {
  if (registered === null) return <CSpinner size="sm" />
  return registered ? (
    <CBadge color="success">Activo</CBadge>
  ) : (
    <CBadge color="secondary">No registrado</CBadge>
  )
}

function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i)

const NotificationSettings = () => {
  const [permission, setPermission] = useState(Notification.permission)
  const [swRegistered, setSwRegistered] = useState(null)
  const [periodicSyncSupported, setPeriodicSyncSupported] = useState(false)
  const [periodicSyncTags, setPeriodicSyncTags] = useState([])
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState(null)

  // Pico y placa hours config
  const [notifyHours, setNotifyHours] = useState(null)
  const [hoursDirty, setHoursDirty] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [hoursSaved, setHoursSaved] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwRegistered(false)
      return
    }
    navigator.serviceWorker.getRegistration('/').then((reg) => {
      setSwRegistered(!!reg)
      if (reg && 'periodicSync' in reg) {
        setPeriodicSyncSupported(true)
        reg.periodicSync.getTags().then(setPeriodicSyncTags).catch(() => {})
      }
    })
  }, [])

  useEffect(() => {
    getNotifyHours().then((hours) => setNotifyHours(hours))
  }, [])

  const requestPermission = async () => {
    setRequesting(true)
    setError(null)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setRequesting(false)
    }
  }

  const registerPeriodicSync = async (tag, minInterval) => {
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.periodicSync.register(tag, { minInterval })
      const tags = await reg.periodicSync.getTags()
      setPeriodicSyncTags(tags)
    } catch (e) {
      setError(`No se pudo registrar "${tag}": ${e.message}`)
    }
  }

  const unregisterPeriodicSync = async (tag) => {
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.periodicSync.unregister(tag)
      const tags = await reg.periodicSync.getTags()
      setPeriodicSyncTags(tags)
    } catch (e) {
      setError(`No se pudo eliminar "${tag}": ${e.message}`)
    }
  }

  const toggleHour = (h) => {
    setNotifyHours((prev) => {
      const next = prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h].sort((a, b) => a - b)
      return next
    })
    setHoursDirty(true)
    setHoursSaved(false)
  }

  const handleSaveHours = async () => {
    setSavingHours(true)
    setError(null)
    try {
      await saveNotifyHours(notifyHours)
      setHoursDirty(false)
      setHoursSaved(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingHours(false)
    }
  }

  const handleResetHours = () => {
    setNotifyHours([...DEFAULT_HOURS])
    setHoursDirty(true)
    setHoursSaved(false)
  }

  const SYNC_TASKS = [
    { tag: 'pico-y-placa', label: 'Pico y Placa', interval: 60 * 60 * 1000 },
    { tag: 'check-active-accounts', label: 'Cuentas activas', interval: 60 * 60 * 1000 },
  ]

  return (
    <div>
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}

      <h6 className="text-secondary mb-3">Permisos</h6>
      <CListGroup className="mb-4">
        <CListGroupItem className="d-flex justify-content-between align-items-center">
          <span>
            <CIcon icon={cilBell} className="me-2" />
            Notificaciones del navegador
          </span>
          <div className="d-flex align-items-center gap-2">
            {getPermissionBadge(permission)}
            {permission === 'default' && (
              <CButton size="sm" color="primary" onClick={requestPermission} disabled={requesting}>
                {requesting ? <CSpinner size="sm" /> : 'Solicitar'}
              </CButton>
            )}
          </div>
        </CListGroupItem>
        <CListGroupItem className="d-flex justify-content-between align-items-center">
          <span>Service Worker</span>
          {getSwStatusBadge(swRegistered)}
        </CListGroupItem>
        <CListGroupItem className="d-flex justify-content-between align-items-center">
          <span>Periodic Background Sync</span>
          <CBadge color={periodicSyncSupported ? 'success' : 'secondary'}>
            {periodicSyncSupported ? 'Soportado' : 'No soportado'}
          </CBadge>
        </CListGroupItem>
      </CListGroup>

      {periodicSyncSupported && (
        <>
          <h6 className="text-secondary mb-3">Tareas periódicas</h6>
          <CListGroup className="mb-4">
            {SYNC_TASKS.map((task) => {
              const active = periodicSyncTags.includes(task.tag)
              return (
                <CListGroupItem
                  key={task.tag}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>{task.label}</span>
                  <div className="d-flex align-items-center gap-2">
                    <CBadge color={active ? 'success' : 'secondary'}>
                      {active ? 'Activa' : 'Inactiva'}
                    </CBadge>
                    {active ? (
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        onClick={() => unregisterPeriodicSync(task.tag)}
                      >
                        Desactivar
                      </CButton>
                    ) : (
                      <CButton
                        size="sm"
                        color="success"
                        variant="outline"
                        onClick={() => registerPeriodicSync(task.tag, task.interval)}
                      >
                        Activar
                      </CButton>
                    )}
                  </div>
                </CListGroupItem>
              )
            })}
          </CListGroup>
        </>
      )}

      <h6 className="text-secondary mb-2">Horarios — Pico y Placa</h6>
      <p className="text-secondary small mb-1">
        Selecciona las horas a las que quieres recibir la notificación. Se almacena localmente en
        este dispositivo.
      </p>
      <div className="d-flex gap-3 mb-3" style={{ fontSize: 12 }}>
        <span><CBadge color="primary">&nbsp;</CBadge> Predeterminada</span>
        <span><CBadge color="success">&nbsp;</CBadge> Personalizada</span>
      </div>
      {notifyHours === null ? (
        <CSpinner size="sm" />
      ) : (
        <>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {ALL_HOURS.map((h) => {
              const selected = notifyHours.includes(h)
              const isDefault = DEFAULT_HOURS.includes(h)
              const color = isDefault ? 'primary' : (selected ? 'success' : 'secondary')
              return (
                <CButton
                  key={h}
                  size="sm"
                  color={color}
                  variant={selected ? undefined : 'outline'}
                  onClick={() => toggleHour(h)}
                  style={{ minWidth: 56, fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatHour(h)}
                </CButton>
              )
            })}
          </div>
          <div className="d-flex align-items-center gap-2">
            <CButton
              size="sm"
              color="primary"
              onClick={handleSaveHours}
              disabled={!hoursDirty || savingHours || notifyHours.length === 0}
            >
              {savingHours ? <CSpinner size="sm" /> : 'Guardar'}
            </CButton>
            <CButton size="sm" color="secondary" variant="outline" onClick={handleResetHours}>
              Restablecer
            </CButton>
            {hoursSaved && !hoursDirty && (
              <span className="text-success small">Guardado</span>
            )}
            {notifyHours.length === 0 && (
              <span className="text-danger small">Selecciona al menos una hora</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationSettings
