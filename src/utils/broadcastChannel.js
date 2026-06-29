const CHANNELS = {
  PICTURES: 'finance-pictures',
  AUTH: 'auth',
}

const PICTURE_EVENTS = {
  UPDATED: 'picture:updated',
}

const AUTH_EVENTS = {
  SIGNED_OUT: 'auth:signed-out',
  SIGNED_IN: 'auth:signed-in',
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

// --- Auth ---

export const emitAuthSignedOut = () => {
  const ch = getChannel(CHANNELS.AUTH)
  if (!ch) return
  ch.postMessage({ type: AUTH_EVENTS.SIGNED_OUT })
  ch.close()
}

export const onAuthSignedOut = (handler) => {
  const ch = getChannel(CHANNELS.AUTH)
  if (!ch) return () => {}
  ch.onmessage = ({ data }) => {
    if (data?.type === AUTH_EVENTS.SIGNED_OUT) handler()
  }
  return () => ch.close()
}

export const emitAuthSignedIn = () => {
  const ch = getChannel(CHANNELS.AUTH)
  if (!ch) return
  ch.postMessage({ type: AUTH_EVENTS.SIGNED_IN })
  ch.close()
}

export const onAuthSignedIn = (handler) => {
  const ch = getChannel(CHANNELS.AUTH)
  if (!ch) return () => {}
  ch.onmessage = ({ data }) => {
    if (data?.type === AUTH_EVENTS.SIGNED_IN) handler()
  }
  return () => ch.close()
}
