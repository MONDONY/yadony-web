import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Les liens partagés par l'app mobile (affiche d'un trajet, demande d'envoi,
// suivi d'un colis) pointent sur yadony.com, servi par ce site. Le VPS
// (pro.yadony.com) rend les pages : chaque chemin doit être redirigé, sinon
// le lien partagé tombe en 404 (cas vécu pour /demande/* le 2026-09-19).
const rules = readFileSync(resolve(__dirname, '../../../public/_redirects'), 'utf8')
  .split('\n')
  .filter((line) => line.trim() && !line.startsWith('#'))
  .map((line) => line.trim().split(/\s+/))

const ruleFor = (from: string) => rules.find(([source]) => source === from)

describe('public/_redirects', () => {
  it.each([
    ['/annonce/*', 'https://pro.yadony.com/annonce/:splat'],
    ['/demande/*', 'https://pro.yadony.com/demande/:splat'],
    ['/tracking/*', 'https://pro.yadony.com/tracking/:splat'],
  ])('redirige %s vers le VPS en 301', (from, to) => {
    expect(ruleFor(from)).toEqual([from, to, '301'])
  })

  it('préserve la méthode HTTP pour l’API (308)', () => {
    expect(ruleFor('/api/*')).toEqual(['/api/*', 'https://pro.yadony.com/api/:splat', '308'])
  })
})
