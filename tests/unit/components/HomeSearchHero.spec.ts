import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import HomeSearchHero from '@/components/home/HomeSearchHero.vue'
import SearchForm from '@/components/search/SearchForm.vue'
import UiButton from '@/components/ui/UiButton.vue'

const push = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

beforeEach(() => {
  push.mockReset()
  // `useLocalePath` est une auto-import de Nuxt : absente hors de l'app.
  vi.stubGlobal('useLocalePath', () => (path: string) => path)
})

function englishPaths() {
  vi.stubGlobal('useLocalePath', () => (path: string) => (path === '/envoyer-colis' ? '/en/send-a-parcel' : path))
}

function mountHero(locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(HomeSearchHero, { global: { plugins: [i18n], components: { SearchForm, UiButton } } })
}

describe('HomeSearchHero', () => {
  it('porte l’unique h1, dans la langue de la page', () => {
    const wrapper = mountHero()
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Quel voyageur part vers chez vous ?')
    expect(mountHero('en').find('h1').text()).toBe('Which traveler is heading your way?')
  })

  it('met le formulaire de recherche avant les trajets fréquents', () => {
    const html = mountHero().html()
    expect(html.indexOf('role="search"')).toBeGreaterThan(-1)
    expect(html.indexOf('role="search"')).toBeLessThan(html.indexOf('Paris → Dakar'))
  })

  it('propose cinq trajets fréquents, liens vers /envoyer-colis avec la recherche', () => {
    const links = mountHero().findAll('a')
    expect(links.map((a) => a.text())).toEqual([
      'Paris → Dakar',
      'Paris → Abidjan',
      'Paris → Bamako',
      'Lyon → Dakar',
      'Marseille → Douala',
    ])
    expect(links.map((a) => a.attributes('href'))).toEqual([
      '/envoyer-colis?depart=Paris&arrivee=Dakar',
      '/envoyer-colis?depart=Paris&arrivee=Abidjan',
      '/envoyer-colis?depart=Paris&arrivee=Bamako',
      '/envoyer-colis?depart=Lyon&arrivee=Dakar',
      '/envoyer-colis?depart=Marseille&arrivee=Douala',
    ])
  })

  it('suit la langue de la page pour les trajets fréquents', () => {
    englishPaths()
    expect(mountHero('en').find('a').attributes('href')).toBe('/en/send-a-parcel?depart=Paris&arrivee=Dakar')
  })

  it('envoie vers la page localisée avec la requête en adresse', async () => {
    englishPaths()
    const wrapper = mountHero('en')
    await wrapper.find('input[name="depart"]').setValue('Paris')
    await wrapper.find('input[name="arrivee"]').setValue('Dakar')
    await wrapper.find('select[name="quand"]').setValue('ce-mois')
    await wrapper.find('form').trigger('submit')
    expect(push).toHaveBeenCalledWith({
      path: '/en/send-a-parcel',
      query: { depart: 'Paris', arrivee: 'Dakar', quand: 'ce-mois' },
    })
  })

  it('un formulaire vide mène à la section de recherche de la page', async () => {
    englishPaths()
    const wrapper = mountHero()
    await wrapper.find('form').trigger('submit')
    expect(push).toHaveBeenCalledWith({ path: '/en/send-a-parcel', query: {}, hash: '#recherche' })
  })

  it('n’affiche aucun résultat ni état de recherche', () => {
    expect(mountHero().find('[data-state]').exists()).toBe(false)
    expect(mountHero().find('article').exists()).toBe(false)
  })
})
