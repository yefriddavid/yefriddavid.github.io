export const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1200
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width)
          width = MAX
        } else {
          width = Math.round((width * MAX) / height)
          height = MAX
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject
    img.src = url
  })
}

export async function pdfToSingleImage(file) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.js',
    import.meta.url,
  ).toString()
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageCount = pdfDoc.numPages
  const scale = 1.5
  const pageCanvases = []
  let totalHeight = 0
  let maxWidth = 0

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    pageCanvases.push(canvas)
    totalHeight += viewport.height
    maxWidth = Math.max(maxWidth, viewport.width)
  }

  const final = document.createElement('canvas')
  final.width = maxWidth
  final.height = totalHeight
  const ctx = final.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, maxWidth, totalHeight)
  let y = 0
  for (const pc of pageCanvases) {
    ctx.drawImage(pc, 0, y)
    y += pc.height
  }
  return final.toDataURL('image/jpeg', 0.65)
}

export async function processAttachmentFile(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error('El archivo supera el límite de 5 MB.')
  const isPdf = file.type === 'application/pdf'
  const isImage = file.type.startsWith('image/')
  if (!isPdf && !isImage) throw new Error('Solo se permiten imágenes o PDF.')
  return isPdf ? pdfToSingleImage(file) : compressImage(file)
}
