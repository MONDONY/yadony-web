import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Garde-fou de poids : une image du site au-delà de 200 Ko ferait sauter le
// budget Lighthouse (1 Mo par page). Les vidéos et leurs posters ont leur
// propre dossier et ne passent pas par ce contrôle.
const IMG = join(process.cwd(), 'public/img')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

describe('images publiques', () => {
  it('aucune image générée ne dépasse 200 Ko', () => {
    const heavy = walk(IMG).filter(path => statSync(path).size > 200 * 1024)
    expect(heavy).toEqual([])
  })

  it('chaque image existe en AVIF et en WebP', () => {
    const files = walk(IMG)
    for (const avif of files.filter(path => path.endsWith('.avif'))) {
      expect(files).toContain(avif.replace(/\.avif$/, '.webp'))
    }
  })
})
