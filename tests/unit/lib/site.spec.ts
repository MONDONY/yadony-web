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
   * L'app Android est publiée sur Google Play ; l'app iOS est encore en
   * examen chez Apple. Les boutons du site suivent chacun leur drapeau.
   */
  it('publie le lien Google Play et garde l’App Store en attente', () => {
    expect(playStoreLive).toBe(true)
    expect(appStoreLive).toBe(false)
  })

  it('pointe vers les vraies fiches des stores', () => {
    expect(playStoreUrl).toBe('https://play.google.com/store/apps/details?id=com.yadony.yadony')
    expect(appStoreUrl).toBe('https://apps.apple.com/app/id6797821239')
  })
})
