import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import ContestTable from '@/components/contest/ContestTable.vue'
import ContestRules from '@/components/contest/ContestRules.vue'
import { classer } from '@/lib/classement/score'
import { normaliserPremiers } from '@/lib/classement/premiers'
import type { Testeur } from '@/lib/classement/types'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

function testeur(id: string, nom: string, tests: string[]): Testeur {
  return {
    id,
    nom,
    tests,
    bugs: 0,
    suggestions: 0,
    ecransAvecAvis: 0,
    indicatif: { ecrans: 0, minutes: 0 },
    dernierPoint: null,
  }
}

const testeurs = [testeur('a', 'Awa D.', ['litige', 'filtres']), testeur('b', 'Koro D.', ['litige'])]
const premiers = normaliserPremiers({ litige: 'b', filtres: 'a' }, testeurs)
const lignes = classer(testeurs)

describe('badges « 1er » dans le tableau', () => {
  it('affiche à côté du nom le nombre de tests réussis en premier', () => {
    const w = mount(ContestTable, { props: { lignes, miseAJour: null, premiers }, global: { plugins: [i18n] } })
    const rangees = w.findAll('[data-testid="board-row"]')
    expect(rangees[0]!.find('[data-testid="premier-badge"]').text()).toContain('1er')
    expect(rangees[1]!.find('[data-testid="premier-badge"]').exists()).toBe(true)
  })

  it('marque « 1er » les tests concernés dans le détail', async () => {
    const w = mount(ContestTable, { props: { lignes, miseAJour: null, premiers }, global: { plugins: [i18n] } })
    await w.find('[data-testid="board-row"] button').trigger('click')
    const items = w.findAll('[data-testid="board-detail"] li')
    const filtres = items.find(li => li.text().includes('Filtres de recherche'))!
    const litige = items.find(li => li.text().includes('Litige'))!
    expect(filtres.find('[data-testid="premier-chip"]').exists()).toBe(true)
    expect(litige.find('[data-testid="premier-chip"]').exists()).toBe(false)
  })

  it('n’affiche aucun badge sans données de premiers', () => {
    const w = mount(ContestTable, { props: { lignes, miseAJour: null }, global: { plugins: [i18n] } })
    expect(w.find('[data-testid="premier-badge"]').exists()).toBe(false)
  })
})

describe('premiers dans le barème', () => {
  it('indique sous chaque test qui l’a réussi en premier', () => {
    const w = mount(ContestRules, { props: { premiers }, global: { plugins: [i18n] } })
    expect(w.find('[data-testid="premier-litige"]').text()).toContain('Koro D.')
    expect(w.find('[data-testid="premier-filtres"]').text()).toContain('Awa D.')
    expect(w.find('[data-testid="premier-appels"]').exists()).toBe(false)
  })
})

describe('règle du bonus dans le barème', () => {
  it('annonce les 40 points du premier', () => {
    const w = mount(ContestRules, { global: { plugins: [i18n] } })
    expect(w.find('[data-testid="regle-premier"]').text()).toContain('40 pts au premier')
  })
})
