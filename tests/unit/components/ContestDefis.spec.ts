import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import ContestDefis from '@/components/contest/ContestDefis.vue'
import type { Defi } from '@/lib/classement/defis'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })
const d1: Defi = { numero: 1, debut: '2026-10-06T17:30:00Z', fin: '2026-10-06T22:00:00Z', points: null, enonce: null, gagnant: null }
const noms = { aaaa1111: 'Koro D.' }

function monter(defis: Defi[], iso: string, variante: 'bandeau' | 'complet' = 'complet') {
  return mount(ContestDefis, { props: { defis, maintenant: new Date(iso), noms, variante }, global: { plugins: [i18n] } })
}

describe('ContestDefis', () => {
  it('annonce le défi du soir avec ses horaires et un compte à rebours', () => {
    const w = monter([d1], '2026-10-06T10:00:00Z')
    expect(w.find('[data-testid="defis"]').attributes('data-etat')).toBe('a_venir')
    const carte = w.find('[data-testid="defi-courant"]').text()
    expect(carte).toContain('Défi n°1')
    expect(carte).toContain('mardi 6 octobre')
    expect(carte).toContain('19 h 30 pile')
    expect(carte).toContain('00 h 00 (heure de Paris)')
    expect(w.find('[data-testid="defi-compte"]').text()).toContain('Lancement dans 7 h 30 min')
    expect(w.text()).toContain('50 à 200 pts bonus pour le 1er')
    expect(w.find('[data-testid="defis-regle"]').text()).toMatch(/plus vite avant la fin du défi/)
    expect(w.find('[data-testid="defis-regle"]').text()).toContain('Deux testeurs qui finissent ensemble gagnent ensemble.')
    expect(w.find('[data-testid="defis-bugs"]').text()).toBe('+40 points par bug pertinent trouvé sur les parcours d\'un défi, une fois validé par l\'équipe.')
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

  it('raconte ce qui s’est passé, un bloc par partie du défi', () => {
    const defi: Defi = {
      ...d1,
      points: 150,
      gagnant: 'aaaa1111',
      bilan: [
        { titre: { fr: 'Zéro espèce', en: 'Zero cash' }, texte: { fr: 'Validé par 5 testeurs.', en: 'Done by 5 testers.' } },
        { titre: { fr: 'L’alerte qui sonne', en: 'The alert that rings' }, texte: { fr: 'Koro D. a ouvert sa correspondance.', en: 'Koro D. opened a match.' } },
      ],
    }
    const w = monter([defi], '2026-10-06T20:00:00Z')
    expect(w.find('[data-testid="defis"]').attributes('data-etat')).toBe('termine')
    const bilan = w.find('[data-testid="defi-bilan"]')
    expect(bilan.text()).toContain('Ce qui s’est passé')
    const blocs = bilan.findAll('li')
    expect(blocs).toHaveLength(2)
    expect(blocs[0]!.text()).toContain('Zéro espèce')
    expect(blocs[0]!.text()).toContain('Validé par 5 testeurs.')
    expect(blocs[1]!.text()).toContain('Koro D. a ouvert sa correspondance.')
  })

  it('classe ceux qui ont réussi le défi, dans l’ordre d’arrivée, avec leur heure', () => {
    const defi: Defi = {
      ...d1,
      points: 150,
      gagnant: 'aaaa1111',
      reussites: [
        { nom: 'Koro D.', fin: '2026-10-06T18:45:22Z' },
        { nom: 'Awa D.', fin: '2026-10-06T18:56:50Z' },
      ],
    }
    const lignes = monter([defi], '2026-10-06T23:00:00Z').find('[data-testid="defi-reussites"]').findAll('li')
    expect(lignes).toHaveLength(2)
    expect(lignes[0]!.text()).toMatch(/1.*Koro D\..*20 h 45/)
    expect(lignes[1]!.text()).toMatch(/2.*Awa D\..*20 h 56/)
  })

  it('liste aussi ceux qui ont réussi deux parties, puis une seule', () => {
    const defi: Defi = {
      ...d1,
      points: 150,
      gagnant: 'aaaa1111',
      partiels: [
        { nom: 'Mariam D.', parties: 1 },
        { nom: 'Koro D.', parties: 2 },
        { nom: 'Salimata D.', parties: 2 },
      ],
    }
    const groupes = monter([defi], '2026-10-06T23:00:00Z').find('[data-testid="defi-partiels"]').findAll('li')
    expect(groupes).toHaveLength(2)
    expect(groupes[0]!.text()).toContain('2 parties sur 3')
    expect(groupes[0]!.text()).toContain('Koro D., Salimata D.')
    expect(groupes[1]!.text()).toContain('1 partie sur 3')
    expect(groupes[1]!.text()).toContain('Mariam D.')
  })

  it('n’affiche pas de récit quand le défi n’en a pas', () => {
    const w = monter([{ ...d1, points: 150, gagnant: 'aaaa1111' }], '2026-10-06T23:00:00Z')
    expect(w.find('[data-testid="defi-bilan"]').exists()).toBe(false)
    expect(w.find('[data-testid="defi-reussites"]').exists()).toBe(false)
    expect(w.find('[data-testid="defi-partiels"]').exists()).toBe(false)
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

  it('garde le récit d’un défi terminé, déroulable dans l’historique', () => {
    const d1fini: Defi = {
      ...d1,
      points: 150,
      gagnant: 'aaaa1111',
      reussites: [{ nom: 'Koro D.', fin: '2026-10-06T18:45:22Z' }],
      partiels: [{ nom: 'Mariam D.', parties: 1 }],
      bilan: [{ titre: { fr: 'Zéro espèce', en: 'Zero cash' }, texte: { fr: 'Validé par 5 testeurs.', en: 'Done by 5 testers.' } }],
    }
    const d2: Defi = { ...d1, numero: 2, debut: '2026-10-07T19:00:00Z', fin: '2026-10-07T21:30:00Z' }
    const w = monter([d1fini, d2], '2026-10-07T09:00:00Z')
    const detail = w.find('[data-testid="defis-historique"] details')
    expect(detail.exists()).toBe(true)
    expect(detail.text()).toContain('Voir le résultat')
    expect(detail.find('[data-testid="defi-reussites"]').text()).toContain('Koro D.')
    expect(detail.find('[data-testid="defi-partiels"]').text()).toContain('Mariam D.')
    expect(detail.find('[data-testid="defi-bilan"]').text()).toContain('Validé par 5 testeurs.')
  })

  it('n’ajoute pas de détail déroulable à un défi passé sans récit', () => {
    const d2: Defi = { ...d1, numero: 2, debut: '2026-10-07T19:00:00Z', fin: '2026-10-07T21:30:00Z' }
    const w = monter([{ ...d1, points: 80, gagnant: 'aaaa1111' }, d2], '2026-10-07T09:00:00Z')
    expect(w.find('[data-testid="defis-historique"] details').exists()).toBe(false)
  })

  it('ne rend rien sans défi', () => {
    expect(monter([], '2026-10-06T10:00:00Z').find('[data-testid="defis"]').exists()).toBe(false)
  })

  it('résume le défi en une ligne qui mène à la section', () => {
    const b = monter([d1], '2026-10-06T10:00:00Z', 'bandeau').find('[data-testid="defis-bandeau"]')
    expect(b.attributes('href')).toBe('#defis')
    expect(b.text()).toContain('Défi n°1 ce soir à 19 h 30')
    expect(b.text()).toContain('Lancement dans 7 h 30 min')
    expect(b.text()).toContain('Voir le défi')
  })

  it('invite à lire l’énoncé pendant le défi, puis annonce le gagnant', () => {
    const live = { ...d1, points: 100, enonce: { fr: 'Défi.', en: 'Challenge.' } }
    const enCours = monter([live], '2026-10-06T18:00:00Z', 'bandeau').text()
    expect(enCours).toContain('Défi n°1 en cours')
    expect(enCours).toContain('100 points en jeu')
    expect(enCours).toContain('Voir l\'énoncé')
    expect(monter([{ ...live, gagnant: 'aaaa1111' }], '2026-10-06T23:00:00Z', 'bandeau').text()).toContain('Gagné par Koro D.')
    expect(monter([d1], '2026-10-06T23:00:00Z', 'bandeau').text()).toContain('Personne n\'a réussi')
  })
})
