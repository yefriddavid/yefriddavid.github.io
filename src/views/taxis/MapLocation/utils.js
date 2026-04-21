export const DEFAULT_CENTER = [6.2442, -75.5812]

/**
 * Helper function to format time differences into relative strings
 */
export const formatTimeAgo = (date) => {
  if (!date) return ''
  const now = new Date()
  const seconds = Math.floor((now - new Date(date)) / 1000)
  if (seconds <= 5) return 'Justo ahora'
  if (seconds < 60) return `${seconds} segundos atras`
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 min atras'
  if (minutes < 60) return `${minutes} mins atras`
  const hours = Math.floor(seconds / 3600)
  if (hours === 1) return '1 hora atras'
  if (hours < 24) return `${hours} horas atras`
  const days = Math.floor(seconds / 86400)
  if (days === 1) return '1 dia atras'
  return `${days} dias atras`
}
