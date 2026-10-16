// Génère les images du site depuis assets-src/ : AVIF + WebP, deux largeurs
// par image, dans public/img/{app,dony}/, puis écrit le manifeste lu par
// app/lib/media.ts. À relancer (`pnpm images`) après tout ajout de source.
//
// assets-src/app/ ne contient que des captures ANONYMISÉES : noms et photos
// de testeurs remplacés, bouton de signalement et mention TestFlight retirés.
// Les captures d'origine ne sont jamais commitées.
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('../../', import.meta.url).pathname
const WIDTHS = { app: [480, 960], dony: [320, 640] }
const manifest = { app: {}, dony: {} }

for (const kind of ['app', 'dony']) {
  const srcDir = join(ROOT, 'assets-src', kind)
  const outDir = join(ROOT, 'public', 'img', kind)
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })
  const files = (await readdir(srcDir)).filter(file => /\.(png|webp|jpe?g)$/.test(file)).sort()
  for (const file of files) {
    const id = file.replace(/\.[a-z]+$/, '')
    const source = sharp(join(srcDir, file))
    const { width, height } = await source.metadata()
    manifest[kind][id] = { width, height }
    for (const target of WIDTHS[kind]) {
      const resized = source.clone().resize({ width: target, withoutEnlargement: true })
      await resized.clone().avif({ quality: 55, effort: 6 }).toFile(join(outDir, `${id}-${target}.avif`))
      await resized.clone().webp({ quality: 78, effort: 6 }).toFile(join(outDir, `${id}-${target}.webp`))
    }
    console.log(`${kind}/${id}`)
  }
}

await writeFile(join(ROOT, 'app/lib/media-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
