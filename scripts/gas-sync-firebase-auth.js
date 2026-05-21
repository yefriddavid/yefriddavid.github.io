/**
 * GAS snippet — Firebase Auth admin sync
 *
 * SETUP (Script Properties en el editor GAS → Project Settings → Script Properties):
 *   SA_EMAIL   = firebase-adminsdk-54pal@cashflow-9cbbc.iam.gserviceaccount.com
 *   SA_KEY     = (contenido completo del campo "private_key" del service-account.json, incluyendo -----BEGIN/END-----)
 *   FB_PROJECT = cashflow-9cbbc
 *
 * En el doPost principal, agrega este case al switch de actions:
 *   case 'syncFirebaseAuthUser':
 *     return respond_(syncFirebaseAuthUser_(params.username, params.password))
 */

// ── OAuth2 token via service account ──────────────────────────────────────────

function getFirebaseToken_() {
  var props = PropertiesService.getScriptProperties()
  var saEmail = props.getProperty('SA_EMAIL')
  var saKey = props.getProperty('SA_KEY').replace(/\\n/g, '\n')

  var now = Math.floor(Date.now() / 1000)
  var claim = {
    iss: saEmail,
    sub: saEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  }

  var header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(
    /=/g,
    '',
  )
  var payload = Utilities.base64EncodeWebSafe(JSON.stringify(claim)).replace(/=/g, '')
  var unsigned = header + '.' + payload
  var sig = Utilities.base64EncodeWebSafe(
    Utilities.computeRsaSha256Signature(unsigned, saKey),
  ).replace(/=/g, '')

  var jwt = unsigned + '.' + sig
  var resp = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload:
      'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt,
  })
  return JSON.parse(resp.getContentText()).access_token
}

// ── Create or update a Firebase Auth account ──────────────────────────────────

function syncFirebaseAuthUser_(username, password) {
  var project = PropertiesService.getScriptProperties().getProperty('FB_PROJECT')
  var email = username.toLowerCase().trim() + '@cashflow.app'
  var token = getFirebaseToken_()
  var headers = {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  }
  var base = 'https://identitytoolkit.googleapis.com/v1/projects/' + project

  // Look up by email
  var lookupResp = UrlFetchApp.fetch(base + '/accounts:lookup', {
    method: 'post',
    headers: headers,
    payload: JSON.stringify({ email: [email] }),
    muteHttpExceptions: true,
  })
  var existing = (JSON.parse(lookupResp.getContentText()).users || [])[0]

  if (existing) {
    // Update password on existing account
    UrlFetchApp.fetch(base + '/accounts:update', {
      method: 'post',
      headers: headers,
      payload: JSON.stringify({ localId: existing.localId, password: password }),
    })
  } else {
    // Create new account
    UrlFetchApp.fetch(base + '/accounts', {
      method: 'post',
      headers: headers,
      payload: JSON.stringify({ email: email, password: password, emailVerified: true }),
    })
  }

  return { success: true }
}

// ── Helper (usa el mismo que tengas en tu doPost) ─────────────────────────────
// function respond_(data) {
//   return ContentService.createTextOutput(JSON.stringify(data))
//     .setMimeType(ContentService.MimeType.JSON)
// }
