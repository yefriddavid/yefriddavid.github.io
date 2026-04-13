import { useEffect } from 'react'

const useNotifications = () => {
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    const register = async () => {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const sw = await navigator.serviceWorker.ready
      if (!('periodicSync' in sw)) return

      const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
      if (status.state !== 'granted') return

      try {
        // await sw.periodicSync.register('check-active-accounts', { minInterval: 60 * 60 * 1000 })
        await sw.periodicSync.register('pico-y-placa', { minInterval: 60 * 60 * 1000 })
      } catch (err) {
        console.error('Periodic Sync registration failed:', err)
      }
    }

    register()
  }, [])
}

export default useNotifications
