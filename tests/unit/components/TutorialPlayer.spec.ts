import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import TutorialPlayer from '@/components/tutorials/TutorialPlayer.vue'
import TutorialCard from '@/components/tutorials/TutorialCard.vue'
import StoreBadges from '@/components/StoreBadges.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { tutorials } from '@/lib/tutorials'

const [search, track] = tutorials

function mountPlayer(props: Record<string, unknown>, locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  // Les vrais boutons des stores (le setup global les remplace par un stub).
  return mount(TutorialPlayer, {
    props,
    attachTo: document.body,
    global: {
      plugins: [i18n],
      stubs: { StoreBadges: false },
      components: { StoreBadges, UiButton },
    },
  })
}

describe('TutorialPlayer', () => {
  beforeEach(() => {
    // happy-dom n'a ni lecture vidéo ni toujours showModal : on les simule.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    })
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('ne contient aucune balise <video> tant qu’aucun tutoriel n’est ouvert', () => {
    const wrapper = mountPlayer({ tutorial: null })
    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('dialog').exists()).toBe(true)
  })

  it('crée la vidéo en preload="none" à l’ouverture, avec la source de la langue', async () => {
    const wrapper = mountPlayer({ tutorial: null })
    await wrapper.setProps({ tutorial: search })
    await flushPromises()
    const video = wrapper.find('video')
    expect(video.exists()).toBe(true)
    expect(video.attributes('preload')).toBe('none')
    expect(video.attributes('src')).toBe('/video/tutos/search.mp4')
    expect(video.attributes('poster')).toBe('/video/tutos/search-poster.jpg')
    expect(video.attributes('playsinline')).toBeDefined()
    expect(video.attributes('controls')).toBeDefined()
    // Pas de téléchargement, mais la vitesse de lecture reste réglable.
    expect(video.attributes('controlslist')).toBe('nodownload')
    expect(wrapper.find('dialog').attributes('open')).toBeDefined()
    expect(wrapper.text()).toContain(fr.tutorials.items.search.title)
    expect(wrapper.text()).toContain(fr.tutorials.items.search.path)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('sert la version anglaise en anglais', async () => {
    const wrapper = mountPlayer({ tutorial: track }, 'en')
    await flushPromises()
    expect(wrapper.find('video').attributes('src')).toBe('/video/tutos/track-en.mp4')
    expect(wrapper.text()).toContain(en.tutorials.items.track.title)
  })

  it('supprime la vidéo et ferme le dialogue quand le tutoriel redevient nul', async () => {
    const wrapper = mountPlayer({ tutorial: null })
    await wrapper.setProps({ tutorial: search })
    await flushPromises()
    await wrapper.setProps({ tutorial: null })
    await flushPromises()
    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
  })

  it('émet close sur Échap, sur l’annulation native et sur le bouton Fermer', async () => {
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    await wrapper.find('dialog').trigger('keydown', { key: 'Escape' })
    await wrapper.find('dialog').trigger('cancel')
    const close = wrapper.findAll('button').find(b => b.text() === fr.tutorials.close)
    expect(close).toBeDefined()
    await close!.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(3)
  })

  it('émet close sur un clic sur l’arrière-plan, pas sur le contenu', async () => {
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    await wrapper.find('video').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.find('dialog').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('émet close quand le navigateur ferme le dialogue de lui-même', async () => {
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    await wrapper.find('dialog').trigger('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('n’émet pas close quand il se ferme parce que le tutoriel est nul', async () => {
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    await wrapper.setProps({ tutorial: null })
    await wrapper.find('dialog').trigger('close')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('propose la vidéo suivante seulement quand il y en a une', async () => {
    const wrapper = mountPlayer({ tutorial: search, next: track })
    await flushPromises()
    const next = wrapper.findAll('button').find(b => b.text() === fr.tutorials.seeNext)
    expect(next).toBeDefined()
    await next!.trigger('click')
    expect(wrapper.emitted('next')).toEqual([['track']])
    await wrapper.setProps({ next: null })
    expect(wrapper.findAll('button').some(b => b.text() === fr.tutorials.seeNext)).toBe(false)
  })

  it('garde la lecture manuelle si le navigateur refuse la lecture automatique', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('NotAllowedError'))
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    expect(wrapper.find('video').exists()).toBe(true)
  })

  it('propose les boutons des stores, sans aucun lien vers /ouvrir', async () => {
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    const labels = wrapper.findAll('button').map(b => b.text())
    expect(labels).toContain(fr.home.hero.appStore)
    expect(labels).toContain(fr.home.hero.playStore)
    expect(wrapper.findAll('a')).toHaveLength(0)
    expect(wrapper.html()).not.toContain('/ouvrir')
  })

  it('un bouton de store ouvre la fenêtre « bientôt disponible » dans le lecteur', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    showModal.mockClear()
    const store = wrapper.findAll('button').find(b => b.text() === fr.home.hero.appStore)
    await store!.trigger('click')
    expect(showModal).toHaveBeenCalledTimes(1)
    const comingSoon = wrapper.find(`dialog[aria-label="${fr.stores.comingSoonAll.title}"]`)
    expect(comingSoon.exists()).toBe(true)
    expect(comingSoon.attributes('open')).toBeDefined()
  })

  it('Échap dans la fenêtre « bientôt disponible » ne ferme pas le lecteur', async () => {
    const wrapper = mountPlayer({ tutorial: search })
    await flushPromises()
    const comingSoon = wrapper.find(`dialog[aria-label="${fr.stores.comingSoonAll.title}"]`)
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    comingSoon.element.dispatchEvent(event)
    expect(wrapper.emitted('close')).toBeUndefined()
    // Le navigateur doit pouvoir fermer la petite fenêtre : pas de preventDefault.
    expect(event.defaultPrevented).toBe(false)
    // Échap depuis le lecteur lui-même ferme toujours le lecteur.
    await wrapper.find('video').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})

describe('TutorialCard', () => {
  it('affiche titre, durée, chemin et affiche, sans aucune balise <video>', () => {
    const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr, en } })
    const wrapper = mount(TutorialCard, { props: { tutorial: search }, global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain(fr.tutorials.items.search.title)
    expect(wrapper.text()).toContain('1 min 29')
    expect(wrapper.text()).toContain(fr.tutorials.items.search.path)
    expect(wrapper.find('img').attributes('src')).toBe('/video/tutos/search-poster.jpg')
    expect(wrapper.find('video').exists()).toBe(false)
  })

  it('émet open avec l’identifiant au clic', async () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { fr, en } })
    const wrapper = mount(TutorialCard, { props: { tutorial: track }, global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain('1 min 16 s')
    expect(wrapper.find('img').attributes('src')).toBe('/video/tutos/track-en-poster.jpg')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('open')).toEqual([['track']])
  })
})
