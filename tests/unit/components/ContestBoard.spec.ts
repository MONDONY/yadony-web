import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import ContestPodium from '@/components/contest/ContestPodium.vue'
import ContestTable from '@/components/contest/ContestTable.vue'
import { classer } from '@/lib/classement/score'
import type { Testeur } from '@/lib/classement/types'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

function testeur(id: string, nom: string, tests: string[], extra: Partial<Testeur> = {}): Testeur {
  return {
    id,
    nom,
    tests,
    bugs: 0,
    suggestions: 0,
    ecransAvecAvis: 0,
    indicatif: { ecrans: 120, minutes: 95 },
    dernierPoint: null,
    ...extra,
  }
}

const lignes = classer([
  testeur('a', 'Awa D.', ['scenario_complet', 'outils'], { bugs: 2 }),
  testeur('b', 'Koro D.', ['litige']),
  testeur('c', 'Moussa T.', ['filtres']),
  testeur('d', 'Ibou C.', ['message_app'], { dernierPoint: '2026-10-06T10:00:00Z' }),
])

describe('ContestPodium', () => {
  it('place le 1er au centre, entre le 2e et le 3e', () => {
    const w = mount(ContestPodium, { props: { lignes }, global: { plugins: [i18n] } })
    const noms = w.findAll('[data-testid="podium-step"] [data-testid="podium-name"]').map(n => n.text())
    // Ibou passe devant Moussa à égalité : il a atteint ses points le premier.
    expect(noms).toEqual(['Koro D.', 'Awa D.', 'Ibou C.'])
    expect(w.find('[data-rank="1"]').text()).toContain('220')
  })

  it('affiche le rang partagé sur les médailles des ex æquo', () => {
    const egalite = classer([
      testeur('x', 'Awa D.', ['litige']),
      testeur('y', 'Koro D.', ['nego_colis']),
      testeur('z', 'Moussa T.', ['filtres']),
    ])
    const w = mount(ContestPodium, { props: { lignes: egalite }, global: { plugins: [i18n] } })
    const medailles = w.findAll('[data-testid="podium-medal"]').map(m => m.text())
    expect(medailles).toEqual(['1', '1', '3'])
  })

  it('centre le 1er même quand il est seul', () => {
    const w = mount(ContestPodium, { props: { lignes: lignes.slice(0, 1) }, global: { plugins: [i18n] } })
    expect(w.find('[data-testid="podium-step"]').classes()).toContain('col-start-2')
  })

  it('garde les trois marches côte à côte, même sur téléphone', () => {
    const w = mount(ContestPodium, { props: { lignes }, global: { plugins: [i18n] } })
    const classes = w.find('[data-testid="podium"]').classes()
    expect(classes).toContain('grid-cols-[1fr_1.12fr_1fr]')
    expect(classes.some(c => c.startsWith('sm:grid-cols'))).toBe(false)
  })

  it('compte les tests comme le tableau', () => {
    const avecRetours = classer([testeur('a', 'Awa D.', ['litige'], { ecransAvecAvis: 2, suggestions: 1 })])
    const w = mount(ContestPodium, { props: { lignes: avecRetours }, global: { plugins: [i18n] } })
    expect(w.text()).toContain('3 tests validés')
  })

  it("n'affiche que les marches existantes", () => {
    const w = mount(ContestPodium, { props: { lignes: lignes.slice(0, 2) }, global: { plugins: [i18n] } })
    expect(w.findAll('[data-testid="podium-step"]')).toHaveLength(2)
  })

  it("n'affiche rien sans testeur", () => {
    const w = mount(ContestPodium, { props: { lignes: [] }, global: { plugins: [i18n] } })
    expect(w.find('[data-testid="podium-step"]').exists()).toBe(false)
  })
})

describe('ContestTable', () => {
  function monter() {
    return mount(ContestTable, {
      props: { lignes, miseAJour: '2026-10-08T16:00:00Z' },
      global: { plugins: [i18n] },
    })
  }

  it('affiche une ligne par testeur avec son rang, son nom et ses points', () => {
    const w = monter()
    const rangees = w.findAll('[data-testid="board-row"]')
    expect(rangees).toHaveLength(4)
    expect(rangees[0]!.text()).toContain('Awa D.')
    expect(rangees[0]!.text()).toContain('220')
    expect(rangees[0]!.text()).toContain('2 / 26')
  })

  it('donne le même rang aux ex æquo', () => {
    const rangs = monter().findAll('[data-testid="board-rank"]').map(r => r.text())
    expect(rangs).toEqual(['1', '2', '3', '3'])
  })

  it('déplie le détail des points au clic', async () => {
    const w = monter()
    const bouton = w.find('[data-testid="board-row"] button')
    expect(bouton.attributes('aria-expanded')).toBe('false')
    expect(w.find('[data-testid="board-detail"]').exists()).toBe(false)

    await bouton.trigger('click')

    expect(bouton.attributes('aria-expanded')).toBe('true')
    const detail = w.find('[data-testid="board-detail"]')
    expect(detail.text()).toContain('Scénario complet')
    expect(detail.text()).toContain('+100')
    expect(detail.text()).toContain('2 bugs résolus')
    expect(detail.text()).toContain('+40')

    await bouton.trigger('click')
    expect(w.find('[data-testid="board-detail"]').exists()).toBe(false)
  })

  it('indique la date de mise à jour', () => {
    expect(monter().text()).toContain('Mis à jour le')
  })

  it('résume les tests sous le nom, pour les petits écrans', () => {
    const meta = monter().find('[data-testid="board-row"] [data-testid="board-meta"]')
    expect(meta.text()).toContain('2 / 26 tests')
  })

  it('n’affiche que les 10 premiers et déplie le reste sur demande', async () => {
    const douze = classer(Array.from({ length: 12 }, (_, i) => testeur(`t${i}`, `Testeur ${i}`, i < 6 ? ['litige'] : ['filtres'])))
    const w = mount(ContestTable, { props: { lignes: douze, miseAJour: null }, global: { plugins: [i18n] } })
    expect(w.findAll('[data-testid="board-row"]')).toHaveLength(10)
    const plus = w.find('[data-testid="board-more"]')
    expect(plus.text()).toContain('Voir les 12 testeurs')
    expect(plus.attributes('aria-expanded')).toBe('false')

    await plus.trigger('click')

    expect(w.findAll('[data-testid="board-row"]')).toHaveLength(12)
    expect(w.find('[data-testid="board-more"]').text()).toMatch(/réduire/i)
    expect(w.find('[data-testid="board-more"]').attributes('aria-expanded')).toBe('true')
  })

  it('n’affiche pas le bouton quand tout tient dans le top 10', () => {
    expect(monter().find('[data-testid="board-more"]').exists()).toBe(false)
  })
})
