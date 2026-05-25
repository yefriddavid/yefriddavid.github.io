import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  MAX_IMAGE_BYTES,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_FILE_TYPES,
  createPreview,
  uploadImage,
  uploadImages,
  toDisplayUrl,
  toDisplayUrlSync,
  deleteImage,
  deleteImages,
  isHandle,
  getHandleSize,
  getHandleSizeLabel,
} from '../imageFacade'

// ── Browser-API helpers ───────────────────────────────────────────────────────
// Upload functions delegate to processAttachmentFile which needs browser APIs.
// We mock those APIs rather than the module so concurrent dynamic imports work.

function setupUploadGlobals() {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()
  globalThis.Image = class {
    constructor() {
      this.width = 100
      this.height = 100
      this._onload = null
    }
    set onload(fn) { this._onload = fn }
    set onerror(_fn) {}
    set src(_url) { if (this._onload) setTimeout(() => this._onload(), 0) }
  }
  globalThis.document = {
    createElement: vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: vi.fn() }),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,facadeUpload'),
    })),
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('MAX_IMAGE_BYTES equals 5 MB', () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024)
  })

  it('ACCEPTED_IMAGE_TYPES is image/*', () => {
    expect(ACCEPTED_IMAGE_TYPES).toBe('image/*')
  })

  it('ACCEPTED_FILE_TYPES covers images and PDF', () => {
    expect(ACCEPTED_FILE_TYPES).toBe('image/*,application/pdf')
  })
})

// ── createPreview ─────────────────────────────────────────────────────────────

describe('createPreview', () => {
  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview-url')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('calls URL.createObjectURL with the file', () => {
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    createPreview(file)
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(file)
  })

  it('returns the object URL', () => {
    const { url } = createPreview(new File(['img'], 'p.jpg', { type: 'image/jpeg' }))
    expect(url).toBe('blob:preview-url')
  })

  it('revoke() calls URL.revokeObjectURL with the same URL', () => {
    const { url, revoke } = createPreview(new File(['img'], 'p.jpg', { type: 'image/jpeg' }))
    revoke()
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(url)
  })
})

// ── toDisplayUrlSync ──────────────────────────────────────────────────────────

describe('toDisplayUrlSync', () => {
  it('returns the handle unchanged', () => {
    const h = 'data:image/jpeg;base64,abc123'
    expect(toDisplayUrlSync(h)).toBe(h)
  })

  it('returns null for null', () => {
    expect(toDisplayUrlSync(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(toDisplayUrlSync(undefined)).toBeNull()
  })
})

// ── toDisplayUrl ──────────────────────────────────────────────────────────────

describe('toDisplayUrl', () => {
  it('resolves with the handle (base64 backend is a pass-through)', async () => {
    const h = 'data:image/jpeg;base64,abc123'
    await expect(toDisplayUrl(h)).resolves.toBe(h)
  })

  it('resolves with null for a null handle', async () => {
    await expect(toDisplayUrl(null)).resolves.toBeNull()
  })
})

// ── isHandle ──────────────────────────────────────────────────────────────────

describe('isHandle', () => {
  it.each([
    ['data:image/jpeg;base64,/9j/abc', true],
    ['data:image/png;base64,iVBORw', true],
    ['data:image/webp;base64,UklGR', true],
  ])('%s → %s', (value, expected) => {
    expect(isHandle(value)).toBe(expected)
  })

  it.each([
    [null, false],
    ['', false],
    [42, false],
    ['data:application/pdf;base64,JVBER', false],
    ['https://example.com/image.jpg', false],
    ['tenants/abc/image.jpg', false],
  ])('%s → %s', (value, expected) => {
    expect(isHandle(value)).toBe(expected)
  })
})

// ── getHandleSize ─────────────────────────────────────────────────────────────

describe('getHandleSize', () => {
  it('returns 0 for null', () => expect(getHandleSize(null)).toBe(0))
  it('returns 0 for empty string', () => expect(getHandleSize('')).toBe(0))

  it('calculates bytes from the base64 payload (4 chars = 3 bytes)', () => {
    expect(getHandleSize('data:image/jpeg;base64,AAAA')).toBe(3)
  })

  it('is independent of the URI prefix length', () => {
    const a = getHandleSize('data:image/jpeg;base64,AAAA')
    const b = getHandleSize('data:image/png;base64,AAAA')
    expect(a).toBe(b)
  })

  it('scales linearly with payload length (12 chars = 9 bytes)', () => {
    expect(getHandleSize('data:image/jpeg;base64,AAAAAAAAAAAA')).toBe(9)
  })
})

// ── getHandleSizeLabel ────────────────────────────────────────────────────────

describe('getHandleSizeLabel', () => {
  it("returns '' for null", () => expect(getHandleSizeLabel(null)).toBe(''))
  it("returns '' for empty string", () => expect(getHandleSizeLabel('')).toBe(''))

  it('returns ~X B for a tiny payload (4 chars → 3 bytes)', () => {
    expect(getHandleSizeLabel('data:image/jpeg;base64,AAAA')).toBe('~3 B')
  })

  it('returns ~X KB for a medium payload (> 1 KB)', () => {
    // 1368 payload chars → Math.round(1368 * 3 / 4) = 1026 bytes
    const handle = `data:image/jpeg;base64,${'A'.repeat(1368)}`
    expect(getHandleSizeLabel(handle)).toMatch(/^~\d+ KB$/)
  })

  it('returns ~X.X MB for a large payload (> 1 MB)', () => {
    // 1 400 000 chars → ~1.05 MB
    const handle = `data:image/jpeg;base64,${'A'.repeat(1_400_000)}`
    expect(getHandleSizeLabel(handle)).toMatch(/^~\d+\.\d MB$/)
  })
})

// ── uploadImage ───────────────────────────────────────────────────────────────

describe('uploadImage', () => {
  beforeEach(setupUploadGlobals)

  it('returns a JPEG data URI for an image file', async () => {
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const handle = await uploadImage(file)
    expect(handle).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('propagates type-validation errors from processAttachmentFile', async () => {
    const file = new File(['txt'], 'readme.txt', { type: 'text/plain' })
    await expect(uploadImage(file)).rejects.toThrow('Solo se permiten imágenes o PDF.')
  })

  it('propagates size-limit errors for oversized PDFs', async () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1)
    const file = new File([big], 'large.pdf', { type: 'application/pdf' })
    await expect(uploadImage(file)).rejects.toThrow('El archivo PDF supera el límite de 5 MB.')
  })
})

// ── uploadImages ──────────────────────────────────────────────────────────────

describe('uploadImages', () => {
  beforeEach(setupUploadGlobals)

  it('returns one handle per file in the same order as input', async () => {
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
      new File(['c'], 'c.jpg', { type: 'image/jpeg' }),
    ]
    const handles = await uploadImages(files)
    expect(handles).toHaveLength(3)
    expect(handles.every((h) => h.startsWith('data:image/jpeg;base64,'))).toBe(true)
  })

  it('accepts a FileList-like iterable (Array.from compatible)', async () => {
    const fileList = {
      0: new File(['x'], 'x.jpg', { type: 'image/jpeg' }),
      1: new File(['y'], 'y.jpg', { type: 'image/jpeg' }),
      length: 2,
      [Symbol.iterator]() {
        let i = 0
        return {
          next: () =>
            i < this.length ? { value: this[i++], done: false } : { value: undefined, done: true },
        }
      },
    }
    const handles = await uploadImages(fileList)
    expect(handles).toHaveLength(2)
  })

  it('returns an empty array for an empty array input', async () => {
    await expect(uploadImages([])).resolves.toEqual([])
  })
})

// ── deleteImage ───────────────────────────────────────────────────────────────

describe('deleteImage', () => {
  it('resolves without error (no-op in base64 backend)', async () => {
    await expect(deleteImage('data:image/jpeg;base64,abc')).resolves.toBeUndefined()
  })

  it('resolves without error for a null handle', async () => {
    await expect(deleteImage(null)).resolves.toBeUndefined()
  })
})

// ── deleteImages ──────────────────────────────────────────────────────────────

describe('deleteImages', () => {
  it('resolves for an array of handles', async () => {
    await expect(
      deleteImages(['data:image/jpeg;base64,a', 'data:image/jpeg;base64,b']),
    ).resolves.toBeUndefined()
  })

  it('resolves for an empty array', async () => {
    await expect(deleteImages([])).resolves.toBeUndefined()
  })

  it('resolves for null (treated as empty)', async () => {
    await expect(deleteImages(null)).resolves.toBeUndefined()
  })
})
