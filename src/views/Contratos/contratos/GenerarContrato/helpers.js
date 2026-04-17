export const MAX_FILE_BYTES = 5 * 1024 * 1024

export async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 1200
      let { width, height } = img
      if (width > MAX) {
        height = Math.round((height * MAX) / width)
        width = MAX
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.65))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
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

export function formatCOP(raw) {
  const num = String(raw).replace(/\D/g, '')
  return num ? num.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

export function parseCOP(display) {
  return String(display).replace(/\./g, '')
}

export const emptyForm = {
  tenant_full_name: '',
  tenant_identification_number: '',
  tenant_identification_city: '',
  guarantor_full_name: '',
  guarantor_identification_number: '',
  guarantor_identification_city: '',
  owner_full_name: '',
  owner_identification_number: '',
  owner_identification_city: '',
  property_full_address: '',
  property_address: '',
  property_apartment_number: '',
  property_city: '',
  property_state: '',
  property_urbanization: '',
  rental_value: '',
  rental_duration: '',
  rental_start_date: '',
  contract_city: '',
  contract_date: '',
  account_bank_name: '',
  account_type: '',
  account_number: '',
  account_name: '',
}

export function buildPayload(form) {
  return {
    tenant: {
      full_name: form.tenant_full_name,
      identification: {
        number: form.tenant_identification_number,
        city: form.tenant_identification_city,
      },
    },
    guarantor: {
      full_name: form.guarantor_full_name,
      identification: {
        number: form.guarantor_identification_number,
        city: form.guarantor_identification_city,
      },
    },
    owner: {
      full_name: form.owner_full_name,
      identification: {
        number: form.owner_identification_number,
        city: form.owner_identification_city,
      },
    },
    property: {
      full_address: form.property_full_address,
      address: form.property_address || form.property_full_address,
      appartment_number: form.property_apartment_number,
      city: form.property_city,
      state: form.property_state,
      urbanization_name: form.property_urbanization,
    },
    rental: {
      value: parseCOP(form.rental_value),
      duration: form.rental_duration,
      start_date: form.rental_start_date,
    },
    contract: { city: form.contract_city, date: form.contract_date },
    account: {
      bank_name: form.account_bank_name,
      type: form.account_type,
      number: form.account_number,
      name: form.account_name || form.owner_full_name,
    },
  }
}

export function fillFormFromDoc(c) {
  return {
    tenant_full_name: c.tenant?.full_name ?? '',
    tenant_identification_number: c.tenant?.identification?.number ?? '',
    tenant_identification_city: c.tenant?.identification?.city ?? '',
    guarantor_full_name: c.guarantor?.full_name ?? '',
    guarantor_identification_number: c.guarantor?.identification?.number ?? '',
    guarantor_identification_city: c.guarantor?.identification?.city ?? '',
    owner_full_name: c.owner?.full_name ?? '',
    owner_identification_number: c.owner?.identification?.number ?? '',
    owner_identification_city: c.owner?.identification?.city ?? '',
    property_full_address: c.property?.full_address ?? '',
    property_address: c.property?.address ?? '',
    property_apartment_number: c.property?.appartment_number ?? '',
    property_city: c.property?.city ?? '',
    property_state: c.property?.state ?? '',
    property_urbanization: c.property?.urbanization_name ?? '',
    rental_value: c.rental?.value ? formatCOP(c.rental.value) : '',
    rental_duration: c.rental?.duration ?? '',
    rental_start_date: c.rental?.start_date ?? '',
    contract_city: c.contract?.city ?? '',
    contract_date: c.contract?.date ?? '',
    account_bank_name: c.account?.bank_name ?? '',
    account_type: c.account?.type ?? '',
    account_number: c.account?.number ?? '',
    account_name: c.account?.name ?? '',
  }
}
