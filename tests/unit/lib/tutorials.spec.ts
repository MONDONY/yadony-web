import { describe, it, expect } from 'vitest'
import {
  tutorials,
  formatDuration,
  videoSrc,
  posterSrc,
} from '../../../app/lib/tutorials'

describe('tutorials', () => {
  it('liste les 6 tutoriels dans l’ordre voulu, avec public et durée', () => {
    expect(tutorials).toEqual([
      { id: 'search', audience: 'sender', durationSeconds: 89 },
      { id: 'track', audience: 'recipient', durationSeconds: 43 },
      { id: 'payments', audience: 'sender', durationSeconds: 44 },
      { id: 'alerts', audience: 'sender', durationSeconds: 81 },
      { id: 'poster', audience: 'sender', durationSeconds: 40 },
      { id: 'flights', audience: 'traveler', durationSeconds: 35 },
    ])
  })

  it('compte 6 tutoriels aux identifiants uniques', () => {
    expect(tutorials).toHaveLength(6)
    expect(new Set(tutorials.map((t) => t.id)).size).toBe(6)
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

describe('videoSrc et posterSrc', () => {
  it('pointe vers les fichiers français sans suffixe', () => {
    expect(videoSrc('search', 'fr')).toBe('/video/tutos/search.mp4')
    expect(posterSrc('search', 'fr')).toBe('/video/tutos/search-poster.jpg')
  })

  it('pointe vers les fichiers anglais avec le suffixe -en', () => {
    expect(videoSrc('search', 'en')).toBe('/video/tutos/search-en.mp4')
    expect(posterSrc('search', 'en')).toBe('/video/tutos/search-en-poster.jpg')
  })
})
