const metaModules = import.meta.glob(
  '../assets/inmobiliaria/galleries/*/meta.json',
  { eager: true },
)

const imageModules = import.meta.glob(
  '../assets/inmobiliaria/galleries/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true },
)

function buildGalleries() {
  const map = {}

  for (const [path, mod] of Object.entries(metaModules)) {
    const folder = path.split('/').at(-2)
    map[folder] = { folder, ...mod.default, images: [] }
  }

  for (const [path, mod] of Object.entries(imageModules)) {
    const folder = path.split('/').at(-2)
    if (map[folder]) {
      map[folder].images.push(mod.default)
    }
  }

  return Object.values(map)
    .filter((g) => g.images.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export const GALLERIES = buildGalleries()

export const getGallery = (folder) => GALLERIES.find((g) => g.folder === folder) ?? null
