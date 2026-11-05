import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Liens universels (iOS) et App Links (Android) : sans ces deux fichiers, les
// boutons des e-mails ouvrent le site au lieu de l'app (cas vécu le 2026-10-22).
const read = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, '../../../public/.well-known', name), 'utf8'))

describe('apple-app-site-association', () => {
  const detail = read('apple-app-site-association').applinks.details[0]

  it('cible l’app Yadony (Team ID + bundle)', () => {
    expect(detail.appIDs).toEqual(['F5Q74US8XS.com.yadony.yadony'])
  })

  it('ne couvre que /ouvrir', () => {
    expect(detail.components.map((c: Record<string, string>) => c['/'])).toEqual(['/ouvrir'])
  })
})

describe('assetlinks.json', () => {
  const target = read('assetlinks.json')[0].target

  it('cible le paquet Android et la clé de signature Play', () => {
    expect(target.package_name).toBe('com.yadony.yadony')
    expect(target.sha256_cert_fingerprints[0]).toMatch(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/)
  })
})

describe('public/_headers', () => {
  const headers = readFileSync(resolve(__dirname, '../../../public/_headers'), 'utf8')

  it('sert les deux fichiers en JSON', () => {
    expect(headers).toMatch(/\/\.well-known\/apple-app-site-association\n\s+Content-Type: application\/json/)
    expect(headers).toMatch(/\/\.well-known\/assetlinks\.json\n\s+Content-Type: application\/json/)
  })
})
