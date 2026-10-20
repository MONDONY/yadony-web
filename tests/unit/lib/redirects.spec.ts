import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { playStoreUrl } from '@/lib/site'

// Les liens partagés par l'app mobile (affiche d'un trajet, demande d'envoi,
// suivi d'un colis) pointent sur yadony.com, servi par ce site. Le VPS rend
// les pages sous prod.yadony.com : chaque chemin doit être redirigé, sinon le
// lien partagé tombe en 404 (cas vécu pour /demande/* le 2026-09-19).
// pro.yadony.com est réservé au portail professionnel (/pro) : les deux noms
// servent le même VPS, mais les mélanger rend les liens et la documentation
// illisibles.
const rules = readFileSync(resolve(__dirname, '../../../public/_redirects'), 'utf8')
  .split('\n')
  .filter((line) => line.trim() && !line.startsWith('#'))
  .map((line) => line.trim().split(/\s+/))

const ruleFor = (from: string) => rules.find(([source]) => source === from)

describe('public/_redirects', () => {
  it.each([
    ['/annonce/*', 'https://prod.yadony.com/annonce/:splat'],
    ['/demande/*', 'https://prod.yadony.com/demande/:splat'],
    ['/tracking/*', 'https://prod.yadony.com/tracking/:splat'],
    ['/siragbe/*', 'https://prod.yadony.com/siragbe/:splat'],
  ])('redirige %s vers le VPS en 301', (from, to) => {
    expect(ruleFor(from)).toEqual([from, to, '301'])
  })

  it.each([
    ['/legal/terms', '/cgu'],
    ['/legal/privacy', '/confidentialite'],
    ['/legal/account-deletion', '/suppression-compte'],
  ])('redirige %s vers la page légale du site en 301', (from, to) => {
    expect(ruleFor(from)).toEqual([from, to, '301'])
  })

  it.each([
    ['/pro', 'https://pro.yadony.com'],
    ['/pro/*', 'https://pro.yadony.com/pro/:splat'],
  ])('garde %s sur le portail pro', (from, to) => {
    expect(ruleFor(from)).toEqual([from, to, '301'])
  })

  it('réécrit le lien de parrainage /r/{code} vers la page prérendue', () => {
    expect(ruleFor('/r/:code')).toEqual(['/r/:code', '/parrainage?code=:code', '302'])
  })

  it('préserve la méthode HTTP pour l’API (308)', () => {
    expect(ruleFor('/api/*')).toEqual(['/api/*', 'https://prod.yadony.com/api/:splat', '308'])
  })

  it('raccourcit /android vers la fiche Google Play (302)', () => {
    expect(ruleFor('/android')).toEqual(['/android', playStoreUrl, '302'])
  })

  it('ne laisse plus pro.yadony.com que sur les chemins du portail pro', () => {
    const proRules = rules.filter(([, target]) => target?.includes('//pro.yadony.com'))
    expect(proRules.map(([from]) => from)).toEqual(['/pro', '/pro/*'])
  })
})
