const STORAGE_KEY = '_cf_tid'
const SECRET = 'cf_multitenant_2025'

const xor = (str, key) =>
  Array.from(str)
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('')

const encrypt = (value) => btoa(xor(value, SECRET))
const decrypt = (encoded) => xor(atob(encoded), SECRET)

let _tenantId = null

// Auto-initialize from localStorage on module load — survives F5
try {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) _tenantId = decrypt(stored)
} catch (_) {}

export const setTenantId = (id) => {
  _tenantId = id ?? null
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY, encrypt(id))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (_) {}
}

export const clearTenantId = () => {
  _tenantId = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (_) {}
}

export const getTenantId = () => _tenantId
