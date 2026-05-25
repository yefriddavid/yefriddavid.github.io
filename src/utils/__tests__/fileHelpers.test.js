import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MAX_FILE_BYTES, processAttachmentFile, compressImage, pdfToSingleImage } from '../fileHelpers'

// ── pdfjs-dist mock ───────────────────────────────────────────────────────────
// Vitest hoists vi.mock calls, so this intercepts the dynamic import('pdfjs-dist')
// inside pdfToSingleImage even though it's called lazily at runtime.
vi.mock('pdfjs-dist', () => {
  const makePage = (width, height) => ({
    getViewport: vi.fn(() => ({ width, height })),
    render: vi.fn(() => ({ promise: Promise.resolve() })),
  })

  return {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(({ data }) => ({
      promise: Promise.resolve({
        // Two pages of different widths to exercise the stitching logic.
        numPages: 2,
        getPage: vi.fn((n) => Promise.resolve(n === 1 ? makePage(200, 150) : makePage(180, 120))),
      }),
    })),
  }
})

// ── Browser-API helpers ───────────────────────────────────────────────────────

function makeMockCanvas() {
  return {
    width: 0,
    height: 0,
    getContext: () => ({
      drawImage: vi.fn(),
      fillStyle: '',
      fillRect: vi.fn(),
    }),
    toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockImagePayload'),
  }
}

function makeMockImage(width = 100, height = 100) {
  return class MockImage {
    constructor() {
      this.width = width
      this.height = height
      this._onload = null
      this._onerror = null
    }
    get onload() { return this._onload }
    set onload(fn) { this._onload = fn }
    get onerror() { return this._onerror }
    set onerror(fn) { this._onerror = fn }
    set src(_url) {
      if (this._onload) setTimeout(() => this._onload(), 0)
    }
  }
}

function setupBrowserAPIs({ imageWidth = 100, imageHeight = 100 } = {}) {
  let capturedCanvas = null

  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()
  globalThis.Image = makeMockImage(imageWidth, imageHeight)
  globalThis.document = {
    createElement: vi.fn((_tag) => {
      capturedCanvas = makeMockCanvas()
      return capturedCanvas
    }),
  }

  return { getLastCanvas: () => capturedCanvas }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('MAX_FILE_BYTES', () => {
  it('equals 5 MB', () => {
    expect(MAX_FILE_BYTES).toBe(5 * 1024 * 1024)
  })
})

// ── processAttachmentFile ─────────────────────────────────────────────────────

describe('processAttachmentFile', () => {
  it('throws for text/plain files', async () => {
    const file = new File(['content'], 'readme.txt', { type: 'text/plain' })
    await expect(processAttachmentFile(file)).rejects.toThrow('Solo se permiten imágenes o PDF.')
  })

  it('throws for application/json files', async () => {
    const file = new File(['{}'], 'data.json', { type: 'application/json' })
    await expect(processAttachmentFile(file)).rejects.toThrow('Solo se permiten imágenes o PDF.')
  })

  it('throws for audio files', async () => {
    const file = new File(['data'], 'sound.mp3', { type: 'audio/mpeg' })
    await expect(processAttachmentFile(file)).rejects.toThrow('Solo se permiten imágenes o PDF.')
  })

  it('throws when a PDF exceeds MAX_FILE_BYTES', async () => {
    const oversized = new Uint8Array(MAX_FILE_BYTES + 1)
    const file = new File([oversized], 'big.pdf', { type: 'application/pdf' })
    await expect(processAttachmentFile(file)).rejects.toThrow(
      'El archivo PDF supera el límite de 5 MB.',
    )
  })

  it('accepts an image without a size restriction', async () => {
    setupBrowserAPIs({ imageWidth: 800, imageHeight: 600 })
    const file = new File(['img'], 'photo.png', { type: 'image/png' })
    const result = await processAttachmentFile(file)
    expect(result).toBe('data:image/jpeg;base64,mockImagePayload')
  })

  it('accepts a PDF within the size limit', async () => {
    globalThis.document = { createElement: vi.fn(() => makeMockCanvas()) }
    const smallPdf = new Uint8Array(100)
    const file = new File([smallPdf], 'doc.pdf', { type: 'application/pdf' })
    const result = await processAttachmentFile(file)
    expect(result).toBe('data:image/jpeg;base64,mockImagePayload')
  })
})

// ── compressImage ─────────────────────────────────────────────────────────────

describe('compressImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a JPEG data URI', async () => {
    setupBrowserAPIs({ imageWidth: 100, imageHeight: 100 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await compressImage(file)
    expect(result).toBe('data:image/jpeg;base64,mockImagePayload')
  })

  it('calls toDataURL with quality 0.75', async () => {
    const { getLastCanvas } = setupBrowserAPIs({ imageWidth: 100, imageHeight: 100 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await compressImage(file)
    expect(getLastCanvas().toDataURL).toHaveBeenCalledWith('image/jpeg', 0.75)
  })

  it('revokes the object URL after rendering', async () => {
    setupBrowserAPIs({ imageWidth: 100, imageHeight: 100 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await compressImage(file)
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('does not scale an image within 1200 px', async () => {
    const { getLastCanvas } = setupBrowserAPIs({ imageWidth: 800, imageHeight: 600 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await compressImage(file)
    expect(getLastCanvas().width).toBe(800)
    expect(getLastCanvas().height).toBe(600)
  })

  it('scales down a width-dominant image (1600 × 900)', async () => {
    const { getLastCanvas } = setupBrowserAPIs({ imageWidth: 1600, imageHeight: 900 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await compressImage(file)
    expect(getLastCanvas().width).toBe(1200)
    expect(getLastCanvas().height).toBe(Math.round((900 * 1200) / 1600)) // 675
  })

  it('scales down a height-dominant image (900 × 1600)', async () => {
    const { getLastCanvas } = setupBrowserAPIs({ imageWidth: 900, imageHeight: 1600 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await compressImage(file)
    expect(getLastCanvas().width).toBe(Math.round((900 * 1200) / 1600)) // 675
    expect(getLastCanvas().height).toBe(1200)
  })

  it('scales down a square image over the limit (1400 × 1400)', async () => {
    const { getLastCanvas } = setupBrowserAPIs({ imageWidth: 1400, imageHeight: 1400 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await compressImage(file)
    expect(getLastCanvas().width).toBe(1200)
    expect(getLastCanvas().height).toBe(1200)
  })

  it('does not scale a square image at exactly 1200 px', async () => {
    const { getLastCanvas } = setupBrowserAPIs({ imageWidth: 1200, imageHeight: 1200 })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    await compressImage(file)
    expect(getLastCanvas().width).toBe(1200)
    expect(getLastCanvas().height).toBe(1200)
  })
})

// ── pdfToSingleImage ──────────────────────────────────────────────────────────

describe('pdfToSingleImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // pdfToSingleImage creates multiple canvases (one per page + one final).
    globalThis.document = { createElement: vi.fn(() => makeMockCanvas()) }
  })

  it('returns a JPEG data URI', async () => {
    const file = new File([new Uint8Array(10)], 'doc.pdf', { type: 'application/pdf' })
    const result = await pdfToSingleImage(file)
    expect(result).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('creates one canvas per page plus the final stitched canvas', async () => {
    // Mock returns 2 pages → expect 3 canvas creations (page1, page2, final).
    const file = new File([new Uint8Array(10)], 'doc.pdf', { type: 'application/pdf' })
    await pdfToSingleImage(file)
    expect(globalThis.document.createElement).toHaveBeenCalledTimes(3)
  })

  it('stacks pages vertically — final height equals sum of page heights', async () => {
    // Page 1: 200×150, Page 2: 180×120 → final: 200×270
    const canvases = []
    globalThis.document.createElement = vi.fn(() => {
      const c = makeMockCanvas()
      canvases.push(c)
      return c
    })

    const file = new File([new Uint8Array(10)], 'doc.pdf', { type: 'application/pdf' })
    await pdfToSingleImage(file)

    const final = canvases[canvases.length - 1]
    expect(final.width).toBe(200)  // max of 200 and 180
    expect(final.height).toBe(270) // 150 + 120
  })
})
