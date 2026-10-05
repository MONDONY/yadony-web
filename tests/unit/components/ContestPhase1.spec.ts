import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import ContestPhase1 from '@/components/contest/ContestPhase1.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

const donnees = {
  miseAJour: '2026-10-05T14:02:00Z',
  fige: false,
  debut: '2026-09-26T22:00:00Z',
  fin: '2026-10-05T18:00:00Z',
  revelation: '2026-10-05T18:00:00Z',
  testeurs: [
    { nom: 'Awa D.', sessions: 3, minutes: 10, ecrans: 10, bugs: 0 },
    { nom: 'Koro D.', sessions: 9, minutes: 100, ecrans: 100, bugs: 2 },
    { nom: null, sessions: 1, minutes: 1, ecrans: 1, bugs: 0 },
  ],
}

const APRES = new Date('2026-10-05T18:05:00Z')

function monter(fige = false, maintenant: Date | null = APRES) {
  return mount(ContestPhase1, {
    props: { donnees: { ...donnees, fige }, maintenant },
    global: { plugins: [i18n] },
  })
}

describe('ContestPhase1', () => {
  it('classe les testeurs par score avec l’ancienne formule', () => {
    const lignes = monter().findAll('[data-testid="phase1-row"]')
    expect(lignes).toHaveLength(3)
    expect(lignes[0]!.text()).toContain('Koro D.')
    expect(lignes[0]!.text()).toContain('60')
    expect(lignes[1]!.text()).toContain('Awa D.')
  })

  it('affiche « Testeur anonyme » pour un compte sans nom', () => {
    expect(monter().findAll('[data-testid="phase1-row"]')[2]!.text()).toContain('Testeur anonyme')
  })

  it('explique la formule', () => {
    expect(monter().text()).toContain('minutes × 2')
  })

  it('signale un classement provisoire tant qu’il n’est pas figé', () => {
    expect(monter(false).find('[data-testid="phase1-status"]').text()).toMatch(/provisoire/i)
    expect(monter(true).find('[data-testid="phase1-status"]').text()).toMatch(/final/i)
  })

  it('masque les résultats avant 20 h 00 et annonce leur heure', () => {
    const w = monter(false, new Date('2026-10-05T15:00:00Z'))
    expect(w.findAll('[data-testid="phase1-row"]')).toHaveLength(0)
    expect(w.find('[data-testid="phase1-teaser"]').text()).toMatch(/dévoilés/i)
  })

  it('masque les résultats au rendu serveur, quand l’heure est inconnue', () => {
    expect(monter(false, null).findAll('[data-testid="phase1-row"]')).toHaveLength(0)
  })
})
