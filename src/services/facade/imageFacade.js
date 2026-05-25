/**
 * @file imageFacade.js
 * @module services/facade/imageFacade
 *
 * Storage-agnostic image facade.
 *
 * ─── Why this exists ────────────────────────────────────────────────────────
 * All image concerns (compression, upload, preview, display URL resolution,
 * deletion, size estimation) are centralised here. Views, sagas, and services
 * never import from `src/utils/fileHelpers` directly — they call this facade.
 *
 * ─── How to switch backends ─────────────────────────────────────────────────
 * 1. Change BACKEND_ID to the new backend identifier.
 * 2. Add the corresponding case to every switch block in the private
 *    _adapters_ section at the bottom of this file.
 * 3. Nothing else changes — views, sagas, Firestore services are untouched.
 *
 * ─── The "handle" contract ──────────────────────────────────────────────────
 * A handle is the opaque value that gets persisted to the database (Firestore
 * field, array element, etc.).  Views treat handles as black boxes:
 *   • Receive a handle from uploadImage() / uploadImages().
 *   • Pass the handle to toDisplayUrl() to get an <img src>-compatible URL.
 *   • Pass the handle to deleteImage() to clean up remote storage.
 *   • Never inspect, construct, or parse a handle directly.
 *
 * Current backend (base64):
 *   handle = the JPEG data-URI string   (e.g. "data:image/jpeg;base64,/9j/…")
 *   toDisplayUrl(handle) === handle     (the data-URI is already a valid src)
 *   deleteImage(handle)  → no-op        (data lives inside the Firestore doc)
 *
 * Future backend example (Firebase Storage):
 *   handle = storage object path        (e.g. "tenants/abc/drivers/xyz.jpg")
 *   toDisplayUrl(handle) → getDownloadURL(ref(storage, handle))  [async]
 *   deleteImage(handle)  → deleteObject(ref(storage, handle))
 *
 * ─── Migration checklist ────────────────────────────────────────────────────
 * When switching from base64 to a remote storage backend:
 *   [ ] Set BACKEND_ID to the new identifier.
 *   [ ] Implement _remoteUpload(), _remoteDisplayUrl(), _remoteDelete().
 *   [ ] Update isHandle() to recognise the new handle format.
 *   [ ] Write a one-time migration script to move existing base64 blobs
 *       out of Firestore and into the new store, replacing each field with
 *       the new handle. Firestore documents themselves stay untouched beyond
 *       the field swap.
 *   [ ] If toDisplayUrl() becomes async and components render it inline,
 *       add a small useImageUrl(handle) hook that resolves the promise and
 *       caches the result per session.
 */

// ─── Active backend ───────────────────────────────────────────────────────────
// Change this single constant to activate a different backend.
// Valid values: 'base64' | 'firebase-storage' | 's3' | 'cloudinary'
const BACKEND_ID = 'base64'

// ─── Public constants ─────────────────────────────────────────────────────────
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB hard limit for file picker
export const ACCEPTED_IMAGE_TYPES = 'image/*'
export const ACCEPTED_FILE_TYPES = 'image/*,application/pdf'

// ─── Preview (before upload) ─────────────────────────────────────────────────

/**
 * Creates a temporary browser-local preview URL for a File object.
 * Use this to show a thumbnail immediately, before the file is uploaded.
 * Always call revoke() when the preview is unmounted to free memory.
 *
 * @param {File} file
 * @returns {{ url: string, revoke: () => void }}
 *
 * @example
 * const { url, revoke } = createPreview(file)
 * setPreviewUrl(url)
 * // later, on component unmount or when replacing the preview:
 * revoke()
 */
export function createPreview(file) {
  const url = URL.createObjectURL(file)
  return { url, revoke: () => URL.revokeObjectURL(url) }
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Compresses (if image) or converts (if PDF) a single File and uploads it.
 * Returns an opaque handle to be persisted in the database.
 *
 * @param {File} file - Image or PDF file selected by the user.
 * @returns {Promise<string>} Handle representing the stored image.
 *
 * @example
 * const handle = await uploadImage(file)
 * dispatch(actions.updateRequest({ id, photo: handle }))
 */
export async function uploadImage(file) {
  switch (BACKEND_ID) {
    case 'base64':
      return _base64UploadSingle(file)
    // case 'firebase-storage':
    //   return _storageUpload(file)
    default:
      throw new Error(`[imageFacade] Unknown backend: ${BACKEND_ID}`)
  }
}

/**
 * Uploads multiple files in parallel.
 * Accepts a FileList, an Array of Files, or any iterable.
 *
 * @param {FileList|File[]} files
 * @returns {Promise<string[]>} Array of handles in the same order as input.
 *
 * @example
 * const handles = await uploadImages(e.target.files)
 * setPhotos((prev) => [...prev, ...handles])
 */
export async function uploadImages(files) {
  return Promise.all(Array.from(files).map(uploadImage))
}

// ─── Display ─────────────────────────────────────────────────────────────────

/**
 * Resolves a stored handle to a URL usable in <img src> or CSS background.
 * Always returns a Promise so the interface stays consistent across backends.
 *
 * For the base64 backend this resolves immediately (handle === URL).
 * For remote backends this may perform a network call (e.g. signed URL).
 *
 * @param {string|null} handle
 * @returns {Promise<string|null>}
 *
 * @example
 * const url = await toDisplayUrl(driver.photo)
 * return <img src={url} />
 */
export async function toDisplayUrl(handle) {
  if (!handle) return null
  switch (BACKEND_ID) {
    case 'base64':
      return handle
    // case 'firebase-storage':
    //   return getDownloadURL(ref(storage, handle))
    default:
      return handle
  }
}

/**
 * Synchronous variant of toDisplayUrl — safe only with the base64 backend.
 * Use this in render functions where you cannot await.
 * For remote storage backends, use a useImageUrl() hook instead.
 *
 * @param {string|null} handle
 * @returns {string|null}
 */
export function toDisplayUrlSync(handle) {
  return handle ?? null
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Deletes the image from the storage backend.
 * For base64: no-op (caller clears the Firestore field by setting it to null).
 * For remote backends: removes the object from the bucket.
 *
 * @param {string|null} handle
 * @returns {Promise<void>}
 */
export async function deleteImage(handle) {
  if (!handle) return
  switch (BACKEND_ID) {
    case 'base64':
      return
    // case 'firebase-storage':
    //   await deleteObject(ref(storage, handle))
    //   return
    default:
      return
  }
}

/**
 * Deletes multiple images in parallel.
 *
 * @param {string[]} handles
 * @returns {Promise<void>}
 */
export async function deleteImages(handles) {
  await Promise.all((handles ?? []).map(deleteImage))
}

// ─── Introspection ────────────────────────────────────────────────────────────

/**
 * Returns true when value is a valid stored handle for the current backend.
 * Use this to differentiate a real handle from null / empty string / stale data.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isHandle(value) {
  if (!value || typeof value !== 'string') return false
  switch (BACKEND_ID) {
    case 'base64':
      return value.startsWith('data:image')
    // case 'firebase-storage':
    //   return value.startsWith('tenants/') || value.startsWith('images/')
    default:
      return false
  }
}

/**
 * Returns the approximate storage size of a handle in bytes.
 * Useful for showing a "~48 KB" label in the UI.
 *
 * @param {string|null} handle
 * @returns {number} bytes
 */
export function getHandleSize(handle) {
  if (!handle) return 0
  switch (BACKEND_ID) {
    case 'base64': {
      // base64 encodes 3 bytes per 4 chars; strip the "data:…;base64," prefix first
      const payload = handle.split(',')[1] ?? handle
      return Math.round((payload.length * 3) / 4)
    }
    // case 'firebase-storage':
    //   return 0 // size not available without a metadata fetch
    default:
      return 0
  }
}

/**
 * Formats a handle's byte size to a human-readable string (e.g. "~48 KB").
 *
 * @param {string|null} handle
 * @returns {string}
 */
export function getHandleSizeLabel(handle) {
  const bytes = getHandleSize(handle)
  if (bytes === 0) return ''
  if (bytes < 1024) return `~${bytes} B`
  if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`
  return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Private adapters ─────────────────────────────────────────────────────────
// Add a new adapter block for each backend you support.

async function _base64UploadSingle(file) {
  const { processAttachmentFile } = await import('src/utils/fileHelpers')
  return processAttachmentFile(file)
}

// async function _storageUpload(file) {
//   const { compressImage } = await import('src/utils/fileHelpers')
//   const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
//   const { storage } = await import('../providers/firebase/settings')
//   const blob = await fetch(await compressImage(file)).then((r) => r.blob())
//   const path = `tenants/${getTenantId()}/images/${Date.now()}_${file.name}`
//   await uploadBytes(ref(storage, path), blob)
//   return path // the handle is the storage path
// }
