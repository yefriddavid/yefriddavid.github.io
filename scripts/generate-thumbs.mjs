import sharp from 'sharp'
import { readdir, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GALLERIES_DIR = path.join(__dirname, '../src/assets/inmobiliaria/galleries')
const THUMB_WIDTH = 480
const THUMB_QUALITY = 72

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

async function processGallery(galleryPath) {
  const thumbDir = path.join(galleryPath, 'thumb')
  if (!existsSync(thumbDir)) await mkdir(thumbDir)

  const files = await readdir(galleryPath)
  const images = files.filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))

  let count = 0
  for (const file of images) {
    const src = path.join(galleryPath, file)
    const dest = path.join(thumbDir, file.replace(/\.[^.]+$/, '.jpg'))

    if (existsSync(dest)) continue

    await sharp(src)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
      .toFile(dest)

    count++
    process.stdout.write(`  ✓ ${file}\n`)
  }
  return count
}

async function run() {
  const folders = await readdir(GALLERIES_DIR)
  for (const folder of folders) {
    const galleryPath = path.join(GALLERIES_DIR, folder)
    const stat = (await import('fs')).statSync(galleryPath)
    if (!stat.isDirectory()) continue

    console.log(`\n📁 ${folder}`)
    const count = await processGallery(galleryPath)
    if (count === 0) console.log('  (sin cambios)')
    else console.log(`  → ${count} thumbs generados`)
  }
  console.log('\n✅ Listo.')
}

run().catch(console.error)
