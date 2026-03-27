import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

// Workbox precaching (injected by VitePWA)
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Allow the app to trigger skipWaiting from the update prompt
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// Firebase Messaging background handler
const app = initializeApp({
  apiKey: 'AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g',
  authDomain: 'cashflow-9cbbc.firebaseapp.com',
  projectId: 'cashflow-9cbbc',
  storageBucket: 'cashflow-9cbbc.appspot.com',
  messagingSenderId: '221005846539',
  appId: '1:221005846539:web:b51908636c88cb25998f0e',
})

const messaging = getMessaging(app)

onBackgroundMessage(messaging, (payload) => {
  const { title, body } = payload.notification ?? {}
  self.registration.showNotification(title ?? 'Notificación', {
    body,
    icon: '/icons/icon.svg',
  })
})
