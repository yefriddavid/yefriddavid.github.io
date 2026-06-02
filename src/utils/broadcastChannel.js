const CHANNELS = {
  PICTURES: 'finance-pictures',
}

const PICTURE_EVENTS = {
  UPDATED: 'picture:updated',
}

const getChannel = (name) => {
  if (typeof BroadcastChannel === 'undefined') return null
  return new BroadcastChannel(name)
}

// --- Pictures ---

export const emitPictureUpdated = (picture) => {
  const ch = getChannel(CHANNELS.PICTURES)
  if (!ch) return
  ch.postMessage({ type: PICTURE_EVENTS.UPDATED, payload: picture })
  ch.close()
}

export const onPictureUpdated = (handler) => {
  const ch = getChannel(CHANNELS.PICTURES)
  if (!ch) return () => {}
  ch.onmessage = ({ data }) => {
    if (data?.type === PICTURE_EVENTS.UPDATED) handler(data.payload)
  }
  return () => ch.close()
}
