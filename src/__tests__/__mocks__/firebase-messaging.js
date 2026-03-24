// Stub for firebase/messaging — used in the Node test environment.
// getMessaging() is called at module load in settings.js; this prevents
// the messaging/unsupported-browser error that Node throws at runtime.
export const getMessaging = () => ({})
export const getToken = () => Promise.resolve('')
export const onMessage = () => () => {}
export const isSupported = () => Promise.resolve(false)
