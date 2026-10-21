import { describe, it, expect } from 'vitest'
import {
  appStoreLive,
  appStoreUrl,
  betaTesting,
  betaWhatsAppGroupUrl,
  playStoreLive,
  playStoreUrl,
  siteUrl,
} from '@/lib/site'

describe('constantes du site', () => {
  it('sert le site en HTTPS sans barre oblique finale', () => {
    expect(siteUrl).toBe('https://yadony.com')
  })

  /**
   * Garde-fou : une invitation de groupe WhatsApp est une URL
   * `https://chat.whatsapp.com/<jeton>`, le jeton étant une suite de lettres
   * et de chiffres d'une vingtaine de caractères. Ce test échoue tant que la
   * valeur de remplacement posée pendant le développement n'a pas été
   * remplacée par le vrai lien, pour qu'un bandeau menant nulle part ne
   * puisse pas partir en production.
   */
  it('pointe vers une vraie invitation de groupe WhatsApp', () => {
    expect(betaWhatsAppGroupUrl).toMatch(/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{15,}$/)
  })

  it('affiche le bandeau tant que la bêta dure', () => {
    expect(betaTesting).toBe(true)
  })

  /**
   * Sortie commune : la fiche Google Play est masquée jusqu'à la validation
   * de l'app iOS par Apple, les deux boutons ouvrent la fenêtre « bientôt ».
   */
  it('garde les deux stores en attente jusqu’à la sortie commune', () => {
    expect(playStoreLive).toBe(false)
    expect(appStoreLive).toBe(false)
  })

  it('pointe vers les vraies fiches des stores', () => {
    expect(playStoreUrl).toBe('https://play.google.com/store/apps/details?id=com.yadony.yadony')
    expect(appStoreUrl).toBe('https://apps.apple.com/app/id6797821239')
  })
})
