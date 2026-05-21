const PASSPHRASE = 'v3lDCa1esgIToEPOxOc='

async function getDerivedKey() {
  const enc = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(PASSPHRASE))
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt'])
}

export async function encryptPassword(plaintext) {
  const key = await getDerivedKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  )
  const combined = new Uint8Array(12 + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), 12)
  return btoa(String.fromCharCode(...combined))
}
