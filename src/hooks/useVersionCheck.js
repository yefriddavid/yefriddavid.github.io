import { useState, useEffect, useRef } from 'react'

const CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutos

const useVersionCheck = () => {
  const [hasUpdate, setHasUpdate] = useState(false)
  const currentVersion = useRef(null)

  useEffect(() => {
    if (import.meta.env.DEV) return

    const check = async () => {
      try {
        // const res = await fetch('./version.json?t=' + Date.now())
        const res = await fetch('/version.json?t=' + Date.now())
        if (!res.ok) return
        const { hash } = await res.json()
        if (currentVersion.current === null) {
          currentVersion.current = hash
        } else if (hash !== currentVersion.current) {
          setHasUpdate(true)
        }
      } catch {}
    }

    check()
    const id = setInterval(check, CHECK_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return hasUpdate
}

export default useVersionCheck
