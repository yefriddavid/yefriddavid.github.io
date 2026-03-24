/**
 * Pico y Placa push notifications via FCM v1 API
 * Scheduler for Google Apps Script — replaces Cloud Functions (free tier)
 *
 * SETUP:
 * 1. Firebase Console → Project Settings → Service accounts → Generate new private key (JSON)
 * 2. In Apps Script: Extensions → Apps Script → Project Settings → Script Properties, add:
 *      SERVICE_ACCOUNT_EMAIL  → client_email value from the downloaded JSON
 *      SERVICE_ACCOUNT_KEY    → private_key value from the downloaded JSON (the full -----BEGIN...-----END block)
 *      FIREBASE_PROJECT_ID    → cashflow-9cbbc
 * 3. Run setupTriggers() once to create the 3 daily triggers
 * 4. Done — no Blaze plan required
 */

// ─── Main notification function ─────────────────────────────────────────────

function sendPicoPlacaNotifications() {
  const projectId = PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID')
  const accessToken = getFirebaseAccessToken()

  const restrictedPlates = getRestrictedPlatesForToday(projectId, accessToken)
  if (restrictedPlates.length === 0) return

  const fcmTokens = getFcmTokens(projectId, accessToken)
  if (fcmTokens.length === 0) return

  const plates = restrictedPlates.join(', ')
  const body = `Hoy tienen pico y placa: ${plates}`

  const failedTokens = []
  for (const token of fcmTokens) {
    const ok = sendFcmMessage(projectId, accessToken, token, '🚕 Pico y Placa', body)
    if (!ok) failedTokens.push(token)
  }

  if (failedTokens.length > 0) {
    deleteExpiredTokens(projectId, accessToken, failedTokens)
  }

  console.log(`Sent to ${fcmTokens.length - failedTokens.length}/${fcmTokens.length} devices. Restricted: ${plates}`)
}

// ─── Pico y placa calculation ────────────────────────────────────────────────

function getRestrictedPlatesForToday(projectId, accessToken) {
  // Colombia is UTC-5
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }))
  const month = now.getMonth() + 1  // 1–12
  const day = now.getDate()

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/taxi_vehiculos`
  const resp = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    muteHttpExceptions: true,
  })

  const data = JSON.parse(resp.getContentText())
  const vehicles = data.documents || []

  const restricted = []
  for (const v of vehicles) {
    const fields = v.fields || {}
    const plate = fields.plate?.stringValue
    if (!plate) continue

    const restrictionsMap = fields.restrictions?.mapValue?.fields || {}
    // Try both number and string key
    const monthRestr =
      restrictionsMap[month]?.mapValue?.fields ||
      restrictionsMap[String(month)]?.mapValue?.fields
    if (!monthRestr) continue

    const d1 = Number(monthRestr.d1?.integerValue ?? monthRestr.d1?.stringValue ?? 0)
    const d2 = Number(monthRestr.d2?.integerValue ?? monthRestr.d2?.stringValue ?? 0)

    if (d1 === day || d2 === day) restricted.push(plate)
  }

  return restricted
}

// ─── FCM token management ────────────────────────────────────────────────────

function getFcmTokens(projectId, accessToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/fcm_tokens`
  const resp = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    muteHttpExceptions: true,
  })

  const data = JSON.parse(resp.getContentText())
  return (data.documents || []).map((d) => d.fields?.token?.stringValue).filter(Boolean)
}

function deleteExpiredTokens(projectId, accessToken, tokens) {
  for (const token of tokens) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/fcm_tokens/${encodeURIComponent(token)}`
    UrlFetchApp.fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      muteHttpExceptions: true,
    })
  }
}

// ─── FCM send ────────────────────────────────────────────────────────────────

function sendFcmMessage(projectId, accessToken, fcmToken, title, body) {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`
  const payload = JSON.stringify({
    message: {
      token: fcmToken,
      notification: { title, body },
    },
  })

  const resp = UrlFetchApp.fetch(url, {
    method: 'POST',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${accessToken}` },
    payload,
    muteHttpExceptions: true,
  })

  const status = resp.getResponseCode()
  if (status !== 200) {
    console.error(`FCM error for token ...${fcmToken.slice(-8)}: ${resp.getContentText()}`)
    return false
  }
  return true
}

// ─── Firebase OAuth (service account JWT) ───────────────────────────────────

function getFirebaseAccessToken() {
  const props = PropertiesService.getScriptProperties()
  const email = props.getProperty('SERVICE_ACCOUNT_EMAIL')
  const privateKey = props.getProperty('SERVICE_ACCOUNT_KEY').replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64url(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }),
  )

  const signed = Utilities.computeRsaSha256Signature(`${header}.${claim}`, privateKey)
  const signature = Utilities.base64EncodeWebSafe(signed).replace(/=+$/, '')
  const jwt = `${header}.${claim}.${signature}`

  const tokenResp = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    payload: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })

  return JSON.parse(tokenResp.getContentText()).access_token
}

function base64url(str) {
  return Utilities.base64EncodeWebSafe(str).replace(/=+$/, '')
}

// ─── Trigger setup (run once) ────────────────────────────────────────────────

function setupTriggers() {
  // Remove existing triggers for this function
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'sendPicoPlacaNotifications')
    .forEach((t) => ScriptApp.deleteTrigger(t))

  // Colombia = UTC-5 → send at 12, 17, 23 UTC (7am, 12pm, 6pm local)
  ;[12, 17, 23].forEach((hour) => {
    ScriptApp.newTrigger('sendPicoPlacaNotifications').timeBased().atHour(hour).everyDays(1).create()
  })

  console.log('3 daily triggers created: 7am, 12pm, 6pm Colombia time')
}
