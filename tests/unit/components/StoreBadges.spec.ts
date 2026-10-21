import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import UiButton from '@/components/ui/UiButton.vue'
import * as site from '@/lib/site'

// Les drapeaux des stores sont des constantes de module : pour couvrir
// chaque combinaison, on recharge le composant avec un `@/lib/site` simulé.
async function mountBadges(
  flags: Partial<Pick<typeof site, 'appStoreLive' | 'playStoreLive'>> = {},
  locale: 'fr' | 'en' = 'fr',
) {
  vi.resetModules()
  vi.doMock('@/lib/site', () => ({ ...site, ...flags }))
  const { default: StoreBadges } = await import('@/components/StoreBadges.vue')
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(StoreBadges, {
    attachTo: document.body,
    global: { plugins: [i18n], components: { UiButton } },
  })
}

afterEach(() => {
  vi.doUnmock('@/lib/site')
  document.body.innerHTML = ''
})

const playLabel = fr.home.hero.playStore
const appLabel = fr.home.hero.appStore

// Android publié, iOS encore en examen.
const playOnly = { appStoreLive: false, playStoreLive: true }

describe('StoreBadges', () => {
  it('pointe le bouton Google Play vers la fiche publiée, dans un nouvel onglet', async () => {
    const wrapper = await mountBadges(playOnly)
    const play = wrapper.findAll('a').find((a) => a.text().includes(playLabel))
    expect(play?.attributes('href')).toBe('https://play.google.com/store/apps/details?id=com.yadony.yadony')
    expect(play?.attributes('href')).toBe(site.playStoreUrl)
    expect(play?.attributes('target')).toBe('_blank')
    expect(play?.attributes('rel')).toBe('noopener noreferrer')
  })

  it('garde l’App Store en bouton qui ouvre la fenêtre « bientôt disponible »', async () => {
    const wrapper = await mountBadges(playOnly)
    expect(wrapper.findAll('a').some((a) => a.text().includes(appLabel))).toBe(false)
    const dialog = wrapper.find('dialog')
    expect(dialog.attributes('aria-label')).toBe(fr.stores.comingSoon.title)
    expect(dialog.attributes('open')).toBeUndefined()

    const appButton = wrapper.findAll('button').find((b) => b.text() === appLabel)
    await appButton?.trigger('click')
    expect(dialog.attributes('open')).toBeDefined()
    expect(dialog.text()).toContain(fr.stores.comingSoon.text)
  })

  it('propose Google Play depuis la fenêtre et se referme', async () => {
    const wrapper = await mountBadges(playOnly)
    const dialog = wrapper.find('dialog')
    ;(dialog.element as HTMLDialogElement).showModal()

    const link = dialog.find('a')
    expect(link.attributes('href')).toBe(site.playStoreUrl)
    expect(link.text()).toContain(fr.stores.comingSoon.playStore)

    await dialog.findAll('button').find((b) => b.text() === fr.stores.comingSoon.close)?.trigger('click')
    expect(dialog.attributes('open')).toBeUndefined()
  })

  it('se referme au clic sur l’arrière-plan, pas sur le contenu', async () => {
    const wrapper = await mountBadges(playOnly)
    const dialog = wrapper.find('dialog')
    ;(dialog.element as HTMLDialogElement).showModal()

    await dialog.find('p').trigger('click')
    expect(dialog.attributes('open')).toBeDefined()
    await dialog.trigger('click')
    expect(dialog.attributes('open')).toBeUndefined()
  })

  it('traduit la fenêtre en anglais', async () => {
    const wrapper = await mountBadges(playOnly, 'en')
    const dialog = wrapper.find('dialog')
    expect(dialog.text()).toContain(en.stores.comingSoon.title)
    expect(dialog.text()).toContain(en.stores.comingSoon.text)
  })

  it('passe les deux boutons en liens et retire la fenêtre quand Apple publie', async () => {
    const wrapper = await mountBadges({ appStoreLive: true, playStoreLive: true })
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual([site.appStoreUrl, site.playStoreUrl])
    expect(wrapper.find('dialog').exists()).toBe(false)
  })

  it('ouvre aussi la fenêtre depuis Google Play si sa fiche est retirée', async () => {
    const wrapper = await mountBadges({ appStoreLive: false, playStoreLive: false })
    expect(wrapper.findAll('a')).toHaveLength(0)
    const dialog = wrapper.find('dialog')
    await wrapper.findAll('button').find((b) => b.text() === playLabel)?.trigger('click')
    expect(dialog.attributes('open')).toBeDefined()
  })

  it('annonce la sortie sur les deux stores quand aucune fiche n’est publiée', async () => {
    const wrapper = await mountBadges({ appStoreLive: false, playStoreLive: false })
    const dialog = wrapper.find('dialog')
    expect(dialog.attributes('aria-label')).toBe(fr.stores.comingSoonAll.title)
    expect(dialog.text()).toContain(fr.stores.comingSoonAll.text)
    expect(dialog.text()).not.toContain(fr.stores.comingSoon.text)
    // Aucun renvoi vers une fiche Google Play masquée.
    expect(dialog.find('a').exists()).toBe(false)
    expect(dialog.text()).not.toContain(fr.stores.comingSoon.playStore)
  })

  it('traduit l’annonce commune en anglais', async () => {
    const wrapper = await mountBadges({ appStoreLive: false, playStoreLive: false }, 'en')
    const dialog = wrapper.find('dialog')
    expect(dialog.text()).toContain(en.stores.comingSoonAll.title)
    expect(dialog.text()).toContain(en.stores.comingSoonAll.text)
    expect(dialog.text()).toContain(en.stores.comingSoonAll.close)
  })

  it('passe aux variantes sombres sur fond foncé', async () => {
    vi.resetModules()
    const { default: StoreBadges } = await import('@/components/StoreBadges.vue')
    const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr, en } })
    const wrapper = mount(StoreBadges, {
      props: { tone: 'dark' },
      global: { plugins: [i18n], components: { UiButton } },
    })
    const classes = wrapper.findAll('a, button').slice(0, 2).map((el) => el.classes().join(' '))
    expect(classes[0]).toContain('bg-accent-strong')
    expect(classes[1]).toContain('border-white/30')
  })
})
