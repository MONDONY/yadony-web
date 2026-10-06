import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import ContestDefis from '@/components/contest/ContestDefis.vue'
import type { Defi } from '@/lib/classement/defis'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })
const d1: Defi = { numero: 1, debut: '2026-10-06T17:30:00Z', fin: '2026-10-06T22:00:00Z', points: null, enonce: null, gagnant: null }
const noms = { aaaa1111: 'Koro D.' }

function monter(defis: Defi[], iso: string) {
  return mount(ContestDefis, { props: { defis, maintenant: new Date(iso), noms }, global: { plugins: [i18n] } })
}

describe('ContestDefis', () => {
  it('annonce le défi du soir avec ses horaires et un compte à rebours', () => {
    const w = monter([d1], '2026-10-06T10:00:00Z')
    expect(w.find('[data-testid="defis"]').attributes('data-etat')).toBe('a_venir')
    const carte = w.find('[data-testid="defi-courant"]').text()
    expect(carte).toContain('Défi n°1')
    expect(carte).toContain('mardi 6 octobre')
    expect(carte).toContain('19 h 30 pile')
    expect(carte).toContain('00 h 00 (minuit, heure de Paris)')
    expect(w.find('[data-testid="defi-compte"]').text()).toContain('Lancement dans 7 h 30 min')
    expect(w.text()).toContain('entre 50 et 150 points bonus')
    expect(w.find('[data-testid="defis-regle"]').text()).toMatch(/plus vite avant minuit/)
  })

  it('n’affiche aucun énoncé avant qu’il soit publié', () => {
    const w = monter([d1], '2026-10-06T17:45:00Z')
    expect(w.find('[data-testid="defi-enonce"]').exists()).toBe(false)
    expect(w.text()).toContain('L\'énoncé arrive dans un instant')
    expect(w.find('[data-testid="defi-compte"]').text()).toContain('Fin dans 4 h 15 min')
  })

  it('dévoile l’énoncé et les points en jeu pendant le défi', () => {
    const defi = { ...d1, points: 100, enonce: { fr: 'Réussir une livraison complète.', en: 'Complete a delivery.' } }
    const w = monter([defi], '2026-10-06T18:00:00Z')
    expect(w.find('[data-testid="defi-enonce"]').text()).toBe('Réussir une livraison complète.')
    expect(w.text()).toContain('100 points en jeu')
  })

  it('montre le nom du gagnant et les points ajoutés à son classement', () => {
    const defi = { ...d1, points: 120, enonce: { fr: 'Défi.', en: 'Challenge.' }, gagnant: 'aaaa1111' }
    const r = monter([defi], '2026-10-06T23:00:00Z').find('[data-testid="defi-resultat"]').text()
    expect(r).toContain('Gagné par Koro D.')
    expect(r).toContain('+120 points ajoutés à son classement')
  })

  it('dit que personne n’a gagné si personne n’a réussi', () => {
    const r = monter([d1], '2026-10-06T23:00:00Z').find('[data-testid="defi-resultat"]').text()
    expect(r).toContain('Personne n\'a relevé le défi')
  })

  it('passe au défi suivant et garde les précédents dans l’historique', () => {
    const d2: Defi = { ...d1, numero: 2, debut: '2026-10-07T17:30:00Z', fin: '2026-10-07T22:00:00Z' }
    const w = monter([{ ...d1, points: 80, gagnant: 'aaaa1111' }, d2], '2026-10-07T09:00:00Z')
    expect(w.find('[data-testid="defi-courant"]').text()).toContain('Défi n°2')
    const h = w.find('[data-testid="defis-historique"]').text()
    expect(h).toContain('Défi n°1')
    expect(h).toContain('Gagné par Koro D.')
  })

  it('ne rend rien sans défi', () => {
    expect(monter([], '2026-10-06T10:00:00Z').find('[data-testid="defis"]').exists()).toBe(false)
  })
})
