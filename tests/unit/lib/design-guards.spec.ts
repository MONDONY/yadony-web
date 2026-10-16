import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Règles du design system partagées avec l'app (dony_app/lib/core/design) :
// couleurs unies uniquement, jamais de dégradé.
const APP = join(process.cwd(), 'app')

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return sources(path)
    return /\.(vue|css|ts)$/.test(entry) ? [path] : []
  })
}

describe('design system', () => {
  it('aucun dégradé dans le code du site', () => {
    const offenders = sources(APP)
      .filter(path => /(linear|radial|conic)-gradient\(/.test(readFileSync(path, 'utf8')))
      .map(path => relative(process.cwd(), path))
    expect(offenders).toEqual([])
  })

  it('les couleurs de marque sont celles de l’app', () => {
    const tokens = readFileSync(join(APP, 'assets/css/tokens.css'), 'utf8')
    // blue500, terra500, ink800, sand100 : tokens ★ de color_tokens.dart
    expect(tokens).toContain('--primary: 11 95 255;')
    expect(tokens).toContain('--accent: 217 106 58;')
    expect(tokens).toContain('--ink: 10 37 64;')
    expect(tokens).toContain('--sand: 247 243 237;')
  })
})
