import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import AppHandoff from '@/components/search/AppHandoff.vue'
import StoreBadges from '@/components/StoreBadges.vue'
import UiButton from '@/components/ui/UiButton.vue'
import type { PublicAnnouncementCard } from '@/lib/public-search'

const card: PublicAnnouncementCard = {
  id: 'a1',
  departureCity: 'Paris',
  arrivalCity: 'Abidjan',
  departureDate: '2026-11-20',
  currency: 'EUR',
  urgent: false,
  traveler: { displayName: 'Awa', identityVerified: true },
}

function mountHandoff(open: boolean, locale: 'fr' | 'en' = 'fr', realStores = false) {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(AppHandoff, {
    props: { card, open },
    attachTo: document.body,
    global: {
      plugins: [i18n],
      components: { StoreBadges, UiButton },
      stubs: realStores ? { StoreBadges: false } : {},
    },
  })
}

// happy-dom n’implémente pas la touche Échap : le navigateur envoie « cancel »
// sur la boîte au sommet de la pile, puis la ferme (et « close » ne remonte pas).
function pressEscape(dialog: HTMLDialogElement) {
  dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  const cancel = new Event('cancel', { cancelable: true })
  dialog.dispatchEvent(cancel)
  if (!cancel.defaultPrevented) dialog.close()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('AppHandoff', () => {
  it('reste fermé tant que open est faux, puis s’ouvre', async () => {
    const wrapper = mountHandoff(false)
    const dialog = wrapper.find('dialog')
    expect(dialog.attributes('open')).toBeUndefined()
    await wrapper.setProps({ open: true })
    expect(dialog.attributes('open')).toBeDefined()
  })

  it('s’ouvre dès le montage quand open est vrai', () => {
    expect(mountHandoff(true).find('dialog').attributes('open')).toBeDefined()
  })

  it('se referme quand open repasse à faux', async () => {
    const wrapper = mountHandoff(true)
    await wrapper.setProps({ open: false })
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
  })

  it('se ferme avec Échap et le signale', async () => {
    const wrapper = mountHandoff(true)
    const dialog = wrapper.find('dialog')
    pressEscape(dialog.element as HTMLDialogElement)
    await wrapper.vm.$nextTick()
    expect(dialog.attributes('open')).toBeUndefined()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('se ferme avec le bouton Fermer', async () => {
    const wrapper = mountHandoff(true)
    await wrapper.findAll('button').find((b) => b.text() === fr.search.handoff.close)!.trigger('click')
    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('se ferme au clic sur l’arrière-plan, pas sur le contenu', async () => {
    const wrapper = mountHandoff(true)
    const dialog = wrapper.find('dialog')
    await dialog.find('h2').trigger('click')
    expect(dialog.attributes('open')).toBeDefined()
    await dialog.trigger('click')
    expect(dialog.attributes('open')).toBeUndefined()
  })

  it('résume le trajet et décrit les trois étapes', () => {
    const wrapper = mountHandoff(true)
    const text = wrapper.text()
    expect(text).toContain(fr.search.handoff.title)
    expect(text).toContain('Awa')
    expect(text).toContain('Paris')
    expect(text).toContain('Abidjan')
    const steps = wrapper.findAll('ol > li > span:last-child').map((li) => li.text())
    expect(steps).toEqual(fr.search.handoff.steps)
    expect(wrapper.find('dialog').attributes('aria-labelledby')).toBe(wrapper.find('h2').attributes('id'))
  })

  it('n’affiche pas de QR code et rend les boutons des stores', () => {
    const wrapper = mountHandoff(true)
    expect(wrapper.find('canvas, svg[data-qr], img').exists()).toBe(false)
    expect(wrapper.find('[data-store-badges]').exists()).toBe(true)
  })

  it('traduit la fenêtre en anglais', () => {
    const wrapper = mountHandoff(true, 'en')
    expect(wrapper.text()).toContain(en.search.handoff.title)
    expect(wrapper.findAll('ol > li > span:last-child').map((li) => li.text())).toEqual(en.search.handoff.steps)
  })

  it('Échap dans la fenêtre « bientôt disponible » ne ferme que celle-ci', async () => {
    const wrapper = mountHandoff(true, 'fr', true)
    const outer = wrapper.find('dialog').element as HTMLDialogElement
    const inner = wrapper.findAll('dialog')[1]!
    expect(inner.element).not.toBe(outer)

    await wrapper.findAll('button').find((b) => b.text() === fr.home.hero.appStore)!.trigger('click')
    expect(inner.attributes('open')).toBeDefined()

    pressEscape(inner.element as HTMLDialogElement)
    await wrapper.vm.$nextTick()
    expect(inner.attributes('open')).toBeUndefined()
    expect(outer.hasAttribute('open')).toBe(true)
    expect(wrapper.emitted('close')).toBeUndefined()

    pressEscape(outer)
    await wrapper.vm.$nextTick()
    expect(outer.hasAttribute('open')).toBe(false)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
