const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()

const toAuthEmail = (username) => `${username.toLowerCase().trim()}@cashflow.app`

exports.syncFirebaseAuthUser = onCall({ region: 'us-central1' }, async (request) => {
  // Require authenticated admin caller
  if (!request.auth) throw new HttpsError('unauthenticated', 'No autenticado')

  const callerUid = request.auth.uid
  const callerRecord = await admin.auth().getUser(callerUid).catch(() => null)
  // Verify caller token claims or fall back to Firestore role check
  const db = admin.firestore()
  const callerSnap = await db.collection('users').where('__name__', '==',
    (await db.collection('users').get()).docs.find(d =>
      toAuthEmail(d.id) === callerRecord?.email
    )?.id ?? ''
  ).get().catch(() => ({ empty: true }))

  // Simpler role check: fetch caller's Firestore doc by matching email
  const allUsers = await db.collection('users').get()
  const callerDoc = allUsers.docs.find(d => toAuthEmail(d.id) === callerRecord?.email)
  const role = callerDoc?.data()?.role
  if (role !== 'superAdmin' && role !== 'admin') {
    throw new HttpsError('permission-denied', 'Se requiere rol admin')
  }

  const { username, password } = request.data
  if (!username || !password || password.length < 6) {
    throw new HttpsError('invalid-argument', 'username y password (mín 6 chars) requeridos')
  }

  const email = toAuthEmail(username)

  try {
    const existing = await admin.auth().getUserByEmail(email)
    await admin.auth().updateUser(existing.uid, { password })
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      await admin.auth().createUser({ email, password, emailVerified: true })
    } else {
      throw new HttpsError('internal', err.message)
    }
  }

  return { success: true }
})
