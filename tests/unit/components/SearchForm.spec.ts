import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import SearchForm from '@/components/search/SearchForm.vue'
import UiButton from '@/components/ui/UiButton.vue'
import type { SearchQuery } from '@/lib/public-search'

const empty: SearchQuery = { depart: '', arrivee: '', quand: '', page: 0 }

function mountForm(modelValue: SearchQuery = empty, locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(SearchForm, { props: { modelValue }, global: { plugins: [i18n], components: { UiButton } } })
}

const submitLabel = fr.search.form.submit

describe('SearchForm', () => {
  it('propose Abidjan pour « abi » dans la liste de l’arrivée', async () => {
    const wrapper = mountForm()
    const input = wrapper.find('input[name="arrivee"]')
    await input.setValue('abi')
    const listId = input.attributes('list')
    expect(listId).toBeTruthy()
    const options = wrapper.findAll(`datalist#${listId} option`).map((o) => o.attributes('value'))
    expect(options).toEqual(['Abidjan'])
  })

  it('propose aussi les villes de départ', async () => {
    const wrapper = mountForm()
    const input = wrapper.find('input[name="depart"]')
    await input.setValue('par')
    const options = wrapper.findAll(`datalist#${input.attributes('list')} option`).map((o) => o.attributes('value'))
    expect(options).toEqual(['Paris'])
  })

  it('émet submit avec la valeur courante, passée par parseSearchQuery', async () => {
    const wrapper = mountForm({ ...empty, page: 3 })
    await wrapper.find('input[name="depart"]').setValue('  Paris  ')
    await wrapper.find('input[name="arrivee"]').setValue('x'.repeat(200))
    await wrapper.find('select[name="quand"]').setValue('ce-mois')
    await wrapper.find('form').trigger('submit')
    const expected = { depart: 'Paris', arrivee: 'x'.repeat(80), quand: 'ce-mois', page: 0 }
    expect(wrapper.emitted('update:modelValue')).toEqual([[expected]])
    expect(wrapper.emitted('submit')).toEqual([[expected]])
  })

  it('ne valide pas une valeur de « Quand » inconnue', async () => {
    const wrapper = mountForm()
    const select = wrapper.find('select[name="quand"]')
    expect(select.findAll('option').map((o) => o.attributes('value'))).toEqual(['', 'ce-mois', '3-mois'])
  })

  it('soumet depuis le bouton principal', async () => {
    const wrapper = mountForm()
    const button = wrapper.findAll('button').find((b) => b.text() === submitLabel)
    expect(button?.attributes('type')).toBe('submit')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('bascule chaque chip avec aria-pressed et relance la recherche', async () => {
    const wrapper = mountForm()
    const chip = (label: string) => wrapper.findAll('button[aria-pressed]').find((b) => b.text() === label)!

    expect(chip('Urgent').attributes('aria-pressed')).toBe('false')
    await chip('Urgent').trigger('click')
    expect(chip('Urgent').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('submit')!.at(-1)).toEqual([{ ...empty, urgent: true }])

    await chip('≥ 16 kg').trigger('click')
    await chip(fr.search.form.plane).trigger('click')
    expect(wrapper.emitted('submit')!.at(-1)).toEqual([{ ...empty, urgent: true, minKg: 16, mode: 'PLANE' }])

    await chip('Urgent').trigger('click')
    expect(chip('Urgent').attributes('aria-pressed')).toBe('false')
    expect(wrapper.emitted('submit')!.at(-1)).toEqual([{ ...empty, minKg: 16, mode: 'PLANE' }])
  })

  it('affiche un champ pour le prix max quand la chip est enfoncée', async () => {
    const wrapper = mountForm()
    const chip = () => wrapper.findAll('button[aria-pressed]').find((b) => b.text() === fr.search.form.maxPrice)!
    expect(wrapper.find('input[name="maxPrix"]').exists()).toBe(false)
    await chip().trigger('click')
    expect(chip().attributes('aria-pressed')).toBe('true')

    await wrapper.find('input[name="maxPrix"]').setValue('12')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')!.at(-1)).toEqual([{ ...empty, maxPrix: 12 }])

    await chip().trigger('click')
    expect(wrapper.find('input[name="maxPrix"]').exists()).toBe(false)
    expect(wrapper.emitted('submit')!.at(-1)).toEqual([empty])
  })

  it('écarte un prix max hors bornes ou vide', async () => {
    const wrapper = mountForm()
    await wrapper.findAll('button[aria-pressed]').find((b) => b.text() === fr.search.form.maxPrice)!.trigger('click')
    await wrapper.find('input[name="maxPrix"]').setValue('99999999')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')!.at(-1)).toEqual([empty])
    await wrapper.find('input[name="maxPrix"]').setValue('')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')!.at(-1)).toEqual([empty])
  })

  it('reprend la requête de l’adresse et ses filtres', async () => {
    const wrapper = mountForm({ ...empty, depart: 'Paris', minKg: 16, maxPrix: 8, urgent: true, mode: 'PLANE' })
    expect((wrapper.find('input[name="depart"]').element as HTMLInputElement).value).toBe('Paris')
    const pressed = wrapper.findAll('button[aria-pressed="true"]').map((b) => b.text())
    expect(pressed).toEqual(['≥ 16 kg', fr.search.form.maxPrice, 'Urgent', fr.search.form.plane])
    expect((wrapper.find('input[name="maxPrix"]').element as HTMLInputElement).value).toBe('8')

    await wrapper.setProps({ modelValue: { ...empty, arrivee: 'Dakar' } })
    expect((wrapper.find('input[name="depart"]').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('input[name="arrivee"]').element as HTMLInputElement).value).toBe('Dakar')
    expect(wrapper.findAll('button[aria-pressed="true"]')).toHaveLength(0)
  })

  it('traduit le formulaire en anglais', () => {
    const wrapper = mountForm(empty, 'en')
    expect(wrapper.text()).toContain(en.search.form.submit)
    expect(wrapper.text()).toContain(en.search.form.plane)
  })

  it('donne un nom accessible à chaque champ et expose un rôle de recherche', () => {
    const wrapper = mountForm()
    expect(wrapper.find('form').attributes('role')).toBe('search')
    for (const name of ['depart', 'arrivee', 'quand']) {
      const field = wrapper.find(`[name="${name}"]`)
      expect(wrapper.find(`label[for="${field.attributes('id')}"]`).exists()).toBe(true)
    }
  })
})
