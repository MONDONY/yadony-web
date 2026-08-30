import { describe, it, expect } from 'vitest'
import { CONSENT_STORAGE_KEY, parseConsent, shouldShowBanner } from '../../../app/lib/consent'

describe('consent', () => {
  it('expose une clé de stockage stable', () => {
    // La clé fait partie du contrat public : la changer invaliderait le choix
    // déjà enregistré chez tous les visiteurs.
    expect(CONSENT_STORAGE_KEY).toBe('yadony-cookie-consent')
  })

  it.each(['accepted', 'refused'] as const)('accepte la valeur valide %s', (value) => {
    expect(parseConsent(value)).toBe(value)
  })

  it.each([null, '', 'yes', 'ACCEPTED', 'accepted ', '{"a":1}'])(
    'rejette la valeur invalide %j',
    (raw) => {
      expect(parseConsent(raw)).toBeNull()
    },
  )

  it('demande la bannière tant qu aucun choix valide n est enregistré', () => {
    expect(shouldShowBanner(null)).toBe(true)
    expect(shouldShowBanner('corrompu')).toBe(true)
  })

  it('masque la bannière une fois un choix valide enregistré', () => {
    expect(shouldShowBanner('accepted')).toBe(false)
    expect(shouldShowBanner('refused')).toBe(false)
  })
})
