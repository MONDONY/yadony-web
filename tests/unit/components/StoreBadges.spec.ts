import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { en, fr } from '../helpers/messages'
import StoreBadges from '@/components/StoreBadges.vue'
import { appStoreUrl, playStoreUrl } from '@/lib/site'

function mountBadges(locale: 'fr' | 'en' = 'fr', props: { size?: 'md' | 'lg' } = {}) {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(StoreBadges, { props, global: { plugins: [i18n] } })
}

describe('StoreBadges', () => {
  it('relie chaque badge à sa fiche publiée, dans un nouvel onglet', () => {
    const links = mountBadges().findAll('a')
    expect(links.map(a => a.attributes('href'))).toEqual([appStoreUrl, playStoreUrl])
    for (const link of links) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    }
  })

  it('affiche les badges officiels, nommés pour les lecteurs d’écran', () => {
    const images = mountBadges().findAll('img')
    expect(images.map(img => img.attributes('src'))).toEqual([
      '/img/stores/app-store-fr.svg',
      '/img/stores/google-play-fr.png',
    ])
    expect(images.map(img => img.attributes('alt'))).toEqual([fr.home.hero.appStore, fr.home.hero.playStore])
  })

  it('prend les badges anglais sur la version anglaise', () => {
    const images = mountBadges('en').findAll('img')
    expect(images.map(img => img.attributes('src'))).toEqual([
      '/img/stores/app-store-en.svg',
      '/img/stores/google-play-en.png',
    ])
    expect(images.map(img => img.attributes('alt'))).toEqual([en.home.hero.appStore, en.home.hero.playStore])
  })

  it('renvoie des fichiers de badge qui existent', () => {
    for (const locale of ['fr', 'en'] as const) {
      for (const img of mountBadges(locale).findAll('img')) {
        expect(existsSync(resolve(process.cwd(), 'public', img.attributes('src')!.slice(1)))).toBe(true)
      }
    }
  })

  it('donne aux deux badges la même hauteur, d’au moins 44 px (h-12), plus grande en lg', () => {
    expect(mountBadges().findAll('img').map(img => img.classes())).toEqual([
      expect.arrayContaining(['h-12']),
      expect.arrayContaining(['h-12']),
    ])
    expect(mountBadges('fr', { size: 'lg' }).findAll('img').every(img => img.classes().includes('h-14'))).toBe(true)
  })
})
