import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '../services/providers/firebase/settings'
import { saveFcmToken } from '../services/providers/firebase/Security/fcmTokens'

// Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

const useNotifications = () => {
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const sw = await navigator.serviceWorker.ready
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw })
        if (token) await saveFcmToken(token)

        // Register Periodic Background Sync if available
        if ('periodicSync' in sw) {
          const status = await navigator.permissions.query({
            name: 'periodic-background-sync',
          })

          if (status.state === 'granted') {
            try {
              await sw.periodicSync.register('check-active-accounts', {
                minInterval: 1 * 60 * 60 * 1000,
              })
              await sw.periodicSync.register('pico-y-placa', {
                minInterval: 1 * 60 * 60 * 1000,
              })
            } catch (err) {
              console.error('Periodic Sync registration failed:', err)
            }
          }
        }
      } catch (err) {
        console.error('FCM registration failed:', err)
      }
    }

    register()

    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {}
      new Notification(title ?? 'Notificación', { body, icon: '/icons/icon.svg' })
    })

    return unsubscribe
  }, [])
}

export default useNotifications
