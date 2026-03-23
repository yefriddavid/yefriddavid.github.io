import { useState, useEffect } from 'react'

/**
 * Captures the browser's beforeinstallprompt event so we can show
 * a custom install banner instead of the default browser prompt.
 *
 * Returns:
 *   canInstall  — true when the app is installable (not yet installed)
 *   install()   — call this to trigger the native install dialog
 *   dismiss()   — call this to hide the banner without installing
 */
const DISMISSED_KEY = 'pwa_install_dismissed'

const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Already dismissed by the user — don't show again
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // If the app gets installed during the session, hide the banner
    window.addEventListener('appinstalled', () => setCanInstall(false))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setCanInstall(false)
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setCanInstall(false)
  }

  return { canInstall, install, dismiss }
}

export default useInstallPrompt
