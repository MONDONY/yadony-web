import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  tutorials,
  formatDuration,
  tutorialDuration,
  videoSrc,
  posterSrc,
} from '../../../app/lib/tutorials'

describe('tutorials', () => {
  it('liste les tutoriels dans l’ordre des démos, avec leur public', () => {
    expect(tutorials.map((t) => [t.id, t.audience])).toEqual([
      ['search', 'sender'],
      ['nearby', 'sender'],
      ['alerts', 'sender'],
      ['saved', 'sender'],
      ['templates', 'traveler'],
      ['recurring', 'traveler'],
      ['ai', 'sender'],
      ['itemprices', 'traveler'],
      ['poster', 'sender'],
      ['request', 'sender'],
      ['recipients', 'sender'],
      ['receiving', 'recipient'],
      ['track', 'recipient'],
      ['messages', 'sender'],
      ['call', 'sender'],
      ['assistant', 'sender'],
      ['money', 'traveler'],
      ['payments', 'sender'],
      ['invite', 'sender'],
      ['profile', 'sender'],
      ['gppro', 'sender'],
      ['security', 'sender'],
      ['flights', 'traveler'],
    ])
  })

  // Durées réelles des fichiers publiés (ffprobe, arrondies à la seconde).
  it('porte la durée réelle de chaque version, en français et en anglais', () => {
    expect(
      Object.fromEntries(tutorials.map((t) => [t.id, t.durationSeconds])),
    ).toEqual({
      search: { fr: 89, en: 95 },
      nearby: { fr: 65, en: 66 },
      alerts: { fr: 81, en: 86 },
      saved: { fr: 41, en: 42 },
      templates: { fr: 192, en: 166 },
      recurring: { fr: 52, en: 54 },
      ai: { fr: 77, en: 83 },
      itemprices: { fr: 49, en: 58 },
      poster: { fr: 40, en: 46 },
      request: { fr: 118, en: 124 },
      recipients: { fr: 57, en: 43 },
      receiving: { fr: 22, en: 25 },
      track: { fr: 43, en: 76 },
      messages: { fr: 74, en: 38 },
      call: { fr: 42, en: 45 },
      assistant: { fr: 49, en: 48 },
      money: { fr: 24, en: 26 },
      payments: { fr: 44, en: 51 },
      invite: { fr: 30, en: 28 },
      profile: { fr: 31, en: 35 },
      gppro: { fr: 24, en: 31 },
      security: { fr: 41, en: 43 },
      flights: { fr: 35, en: 34 },
    })
  })

  it('a des identifiants uniques et au moins un tutoriel par public', () => {
    expect(new Set(tutorials.map((t) => t.id)).size).toBe(tutorials.length)
    for (const audience of ['sender', 'recipient', 'traveler']) {
      expect(tutorials.some((t) => t.audience === audience)).toBe(true)
    }
  })
})

describe('formatDuration', () => {
  it('formate les minutes et secondes en français', () => {
    expect(formatDuration(89, 'fr')).toBe('1 min 29')
  })

  it('formate les minutes et secondes en anglais', () => {
    expect(formatDuration(89, 'en')).toBe('1 min 29 s')
  })

  it('formate moins d’une minute en secondes', () => {
    expect(formatDuration(43, 'fr')).toBe('43 s')
    expect(formatDuration(43, 'en')).toBe('43 s')
  })

  it('formate une minute pile sans secondes', () => {
    expect(formatDuration(60, 'fr')).toBe('1 min')
    expect(formatDuration(120, 'en')).toBe('2 min')
  })

  it('arrondit les secondes décimales', () => {
    expect(formatDuration(42.6, 'en')).toBe('43 s')
  })
})

describe('tutorialDuration', () => {
  const track = tutorials.find((t) => t.id === 'track')!

  it('affiche la durée de la langue demandée', () => {
    expect(tutorialDuration(track, 'fr')).toBe('43 s')
    expect(tutorialDuration(track, 'en')).toBe('1 min 16 s')
  })

  it('formate la durée du français avec minutes', () => {
    const search = tutorials.find((t) => t.id === 'search')!
    expect(tutorialDuration(search, 'fr')).toBe('1 min 29')
    expect(tutorialDuration(search, 'en')).toBe('1 min 35 s')
  })
})

describe('videoSrc et posterSrc', () => {
  it('pointe vers les fichiers français sans suffixe', () => {
    expect(videoSrc('search', 'fr')).toBe('/video/tutos/search.mp4')
    expect(posterSrc('search', 'fr')).toBe('/video/tutos/search-poster.jpg')
  })

  it('pointe vers les fichiers anglais avec le suffixe -en', () => {
    expect(videoSrc('search', 'en')).toBe('/video/tutos/search-en.mp4')
    expect(posterSrc('search', 'en')).toBe('/video/tutos/search-en-poster.jpg')
  })

  it('a le fichier vidéo et l’affiche de chaque tutoriel dans public/, dans les deux langues', () => {
    const publicDir = resolve(__dirname, '../../../public')
    const missing = tutorials.flatMap(t =>
      (['fr', 'en'] as const).flatMap(locale =>
        [videoSrc(t.id, locale), posterSrc(t.id, locale)].filter(src => !existsSync(publicDir + src)),
      ),
    )
    expect(missing).toEqual([])
  })
})
