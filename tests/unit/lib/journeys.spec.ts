import { describe, expect, it } from 'vitest'
import { crossedJourney, senderJourney, travelerJourney, flightsJourney } from '@/lib/journeys'
import { APP_SCREEN_IDS, DONY_POSE_IDS } from '@/lib/media'
import { fr, en } from '../helpers/messages'

const journeys = { crossedJourney, senderJourney, travelerJourney, flightsJourney }

describe('parcours racontés', () => {
  it('le parcours croisé de l’accueil compte huit étapes', () => {
    expect(crossedJourney).toHaveLength(8)
  })

  it.each(Object.entries(journeys))('%s : identifiants uniques, écrans et poses existants', (_name, steps) => {
    expect(new Set(steps.map(step => step.id)).size).toBe(steps.length)
    for (const step of steps) {
      for (const screen of [step.screen ?? []].flat()) expect(APP_SCREEN_IDS).toContain(screen)
      if (step.pose) expect(DONY_POSE_IDS).toContain(step.pose)
      expect(step.screen ?? step.art).toBeDefined()
    }
  })

  it('chaque étape a son titre et son texte dans les deux langues', () => {
    const sizes = {
      'landing.crossed.steps': crossedJourney.length,
      'journeys.sender.steps': senderJourney.length,
      'journeys.traveler.steps': travelerJourney.length,
      'journeys.flights.steps': flightsJourney.length,
    }
    for (const messages of [fr, en]) {
      for (const [path, size] of Object.entries(sizes)) {
        const list = path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages) as unknown[]
        expect(list, path).toHaveLength(size)
      }
    }
  })
})
