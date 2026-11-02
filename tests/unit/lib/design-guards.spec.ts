import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import tailwind from '../../../tailwind.config'

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

  it('le survol n’agit que sur les appareils qui survolent', () => {
    // Sans cette option, un appui sur téléphone laisse l'état `hover:` collé.
    expect(tailwind.future).toEqual({ hoverOnlyWhenSupported: true })
  })

  it('le mouvement réduit garde un fondu pour les éléments qui le demandent', () => {
    const css = readFileSync(join(APP, 'assets/css/main.css'), 'utf8')
    const bloc = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    // La règle globale coupe toutes les transitions (!important) : seule une
    // classe plus spécifique peut rétablir le fondu.
    expect(bloc).toContain('transition-duration: 0.01ms !important')
    expect(bloc).toMatch(/\.motion-fade\s*{[^}]*transition-property: opacity !important[^}]*transition-duration: 200ms !important/)
  })

  it('le popup du concours utilise le fondu du mouvement réduit', () => {
    const popup = readFileSync(join(APP, 'components/contest/ContestPopup.vue'), 'utf8')
    expect(popup).toMatch(/class="popup-card motion-fade /)
  })
})
