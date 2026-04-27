import { useEffect, useState } from 'react'

export const useRelativeTime = (timestamp) => {
  const [label, setLabel] = useState('—')

  useEffect(() => {
    if (!timestamp) return
    const update = () => {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const diff = Math.floor((Date.now() - date.getTime()) / 1000)
      if (diff < 10) setLabel('Ahora mismo')
      else if (diff < 60) setLabel(`Hace ${diff}s`)
      else if (diff < 3600) setLabel(`Hace ${Math.floor(diff / 60)}m`)
      else setLabel(`Hace ${Math.floor(diff / 3600)}h`)
    }
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [timestamp])

  return label
}
