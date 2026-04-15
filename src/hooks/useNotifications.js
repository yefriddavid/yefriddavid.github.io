import { useEffect } from 'react'
import { checkPicoYPlaca } from 'src/sw/sw-pico-y-placa'

const useNotifications = () => {
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    const register = async () => {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const sw = await navigator.serviceWorker.ready

      // Register periodic background sync (Chrome Android — requires PWA install + engagement)
      if ('periodicSync' in sw) {
        try {
          const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
          if (status.state === 'granted') {
            await sw.periodicSync.register('pico-y-placa', { minInterval: 60 * 60 * 1000 })
          }
        } catch (err) {
          console.warn('Periodic sync not available:', err)
        }
      }
    }

    register()
  }, [])

  // Fallback for Android/devices where periodicSync is not fired:
  // run the pico y placa check whenever the app becomes visible.
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkPicoYPlaca().catch(() => {})
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])
}

export default useNotifications
