import { useState, useEffect } from 'react'
import { getAppSettings } from 'src/services/providers/firebase/admin/appSettings'

export function useAppSetting(key) {
  const [value, setValue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAppSettings()
      .then((settings) => {
        const found = settings.find((s) => s.key === key)
        setValue(found?.value ?? null)
      })
      .catch(() => setValue(null))
      .finally(() => setLoading(false))
  }, [key])

  return { value, loading }
}
