import { describe, expect, it } from 'vitest'
import {
  CONTEST_POPUP_KEY,
  compteARebours,
  doitAfficherPopup,
} from '@/lib/classement/popup'

const debut = '2026-10-05T18:30:00Z'
const fin = '2026-10-12T18:30:00Z'
const base = { chemin: '/', stocke: null, maintenant: new Date('2026-10-06T10:00:00Z'), debut, fin }

describe('doitAfficherPopup', () => {
  it('s’affiche à la première visite pendant le concours', () => {
    expect(doitAfficherPopup(base)).toBe(true)
  })

  it('s’affiche aussi avant le départ, pour annoncer le concours', () => {
    expect(doitAfficherPopup({ ...base, maintenant: new Date('2026-10-05T12:00:00Z') })).toBe(true)
  })

  it('ne revient plus une fois fermée', () => {
    expect(doitAfficherPopup({ ...base, stocke: '1' })).toBe(false)
  })

  it('ignore une valeur stockée inattendue', () => {
    expect(doitAfficherPopup({ ...base, stocke: 'oui' })).toBe(true)
  })

  it('disparaît à la fin du concours', () => {
    expect(doitAfficherPopup({ ...base, maintenant: new Date(fin) })).toBe(false)
  })

  it.each(['/classement', '/classement/', '/en/leaderboard', '/en/leaderboard/'])(
    'ne s’affiche pas sur la page du classement (%s)',
    chemin => {
      expect(doitAfficherPopup({ ...base, chemin })).toBe(false)
    },
  )

  it('s’affiche sur les autres pages, y compris en anglais', () => {
    expect(doitAfficherPopup({ ...base, chemin: '/tarifs' })).toBe(true)
    expect(doitAfficherPopup({ ...base, chemin: '/en/pricing' })).toBe(true)
  })

  it('utilise une clé propre à ce concours', () => {
    expect(CONTEST_POPUP_KEY).toBe('yadony-concours-2026-10-ferme')
  })
})

describe('compteARebours', () => {
  it('découpe le temps restant en jours, heures et minutes', () => {
    expect(compteARebours(fin, new Date('2026-10-08T15:05:00Z'))).toEqual({
      jours: 4,
      heures: 3,
      minutes: 25,
    })
  })

  it('reste à zéro une fois l’échéance passée', () => {
    expect(compteARebours(fin, new Date('2026-10-13T00:00:00Z'))).toEqual({
      jours: 0,
      heures: 0,
      minutes: 0,
    })
  })
})
