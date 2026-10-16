import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { fr } from '../helpers/messages'
import ContestFinal from '@/components/contest/ContestFinal.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

const phase1 = [
  { nom: 'Hadja Maferima T.', score: 651.2 },
  { nom: 'Koro D.', score: 612.9 },
  { nom: 'Salimata D.', score: 386 },
  { nom: 'Tidiane H.', score: 202 },
]
const phase2 = [
  { id: 's', nom: 'Salimata D.', total: 2240 },
  { id: 'h', nom: 'Hadja Maferima T.', total: 2220 },
  { id: 'k', nom: 'Koro D.', total: 2110 },
  { id: 'm', nom: 'Mariam D.', total: 460 },
  { id: 't', nom: 'Tidiane H.', total: 80 },
]

function monter() {
  return mount(ContestFinal, { props: { phase1, phase2 }, global: { plugins: [i18n] } })
}

describe('ContestFinal', () => {
  it('annonce les trois premiers dans le titre, sans désigner une seule gagnante', () => {
    const w = monter()
    expect(w.get('[data-testid="final-title"]').text()).toBe('Hadja Maferima T., Koro D. et Salimata D. remportent le concours !')
    expect(w.find('[data-testid="final-winner"]').exists()).toBe(false)
  })

  it('montre le podium dans l’ordre des totaux', () => {
    const noms = monter().findAll('[data-testid="podium-step"]').map(m => [m.attributes('data-rank'), m.get('[data-testid="podium-name"]').text()])
    expect(noms).toEqual([['2', 'Koro D.'], ['1', 'Hadja Maferima T.'], ['3', 'Salimata D.']])
  })

  it('annonce les trois futurs actionnaires sans montant ni condition', () => {
    const bloc = monter().get('[data-testid="final-shareholders"]').text()
    expect(bloc).toContain('Hadja, Koro et Salimata')
    expect(bloc).toContain('actionnaires')
    expect(bloc).toContain('communiquées personnellement')
    expect(bloc).not.toMatch(/%|€/)
  })

  it('nomme la gagnante de chaque phase', () => {
    const w = monter()
    expect(w.get('[data-testid="final-phase1"]').text()).toContain('Hadja Maferima T.')
    expect(w.get('[data-testid="final-phase1"]').text()).toContain('651')
    expect(w.get('[data-testid="final-phase2"]').text()).toContain('Salimata D.')
    expect(w.get('[data-testid="final-phase2"]').text()).toContain('2 240')
  })

  it('liste la suite du top 10 et les récompenses du top 10', () => {
    const w = monter()
    const lignes = w.findAll('[data-testid="final-row"]')
    expect(lignes.map(l => l.text())).toEqual([
      expect.stringContaining('Mariam D.'),
      expect.stringContaining('Tidiane H.'),
    ])
    expect(lignes[1]!.text()).toContain('202 + 80')
    const lots = w.get('[data-testid="final-rewards"]').text()
    expect(lots).toContain('réductions')
    expect(lots).toContain('ambassadeur')
  })
})
