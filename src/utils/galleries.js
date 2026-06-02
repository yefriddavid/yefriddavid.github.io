const metaModules = import.meta.glob(
  '../assets/inmobiliaria/galleries/*/meta.json',
  { eager: true },
)

const imageModules = import.meta.glob(
  '../assets/inmobiliaria/galleries/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true },
)

const thumbModules = import.meta.glob(
  '../assets/inmobiliaria/galleries/*/thumb/*.{jpg,jpeg,png,webp}',
  { eager: true },
)

const baseName = (p) => p.split('/').at(-1).replace(/\.[^.]+$/, '')

function buildGalleries() {
  const map = {}

  for (const [path, mod] of Object.entries(metaModules)) {
    const folder = path.split('/').at(-2)
    map[folder] = { folder, ...mod.default, images: [], thumbs: [] }
  }

  // index thumbs by folder+basename for fast lookup
  const thumbIndex = {}
  for (const [path, mod] of Object.entries(thumbModules)) {
    const parts = path.split('/')
    const folder = parts.at(-3)
    const base = baseName(path)
    thumbIndex[`${folder}/${base}`] = mod.default
  }

  for (const [path, mod] of Object.entries(imageModules)) {
    const folder = path.split('/').at(-2)
    if (!map[folder]) continue
    const base = baseName(path)
    const thumb = thumbIndex[`${folder}/${base}`] ?? mod.default
    map[folder].images.push(mod.default)
    map[folder].thumbs.push(thumb)
  }

  return Object.values(map)
    .filter((g) => g.images.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export const GALLERIES = buildGalleries()

export const getGallery = (folder) => GALLERIES.find((g) => g.folder === folder) ?? null
