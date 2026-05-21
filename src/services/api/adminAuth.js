import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from 'src/services/firebase/settings'

const functions = getFunctions(app, 'us-central1')

export const syncFirebaseAuthUser = async (username, password) => {
  const fn = httpsCallable(functions, 'syncFirebaseAuthUser')
  const result = await fn({ username, password })
  return result.data
}
