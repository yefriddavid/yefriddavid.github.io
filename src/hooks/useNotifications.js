import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '../services/providers/firebase/settings'
import { saveFcmToken } from '../services/providers/firebase/fcmTokens'

// Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
const VAPID_KEY = 'BDZNMaCGqYirTYSacbGifRVQwa3oCvi8NUFXJt4ocWa8lmTe9upPzKQEJoIIQlw9zb_sopOFIkqy-pHvgg2LehA'

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
