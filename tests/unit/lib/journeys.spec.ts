import { describe, expect, it } from 'vitest'
import { senderJourney, travelerJourney, flightsJourney, travelerTemps, travelerControl } from '@/lib/journeys'
import { APP_SCREEN_IDS, DONY_POSE_IDS } from '@/lib/media'
import { fr, en } from '../helpers/messages'

const journeys = { senderJourney, travelerJourney, flightsJourney }

describe('parcours racontés', () => {
  // Yadony ne vend pas de billets : les alertes de prix ne sont jamais le
  // premier argument. Les parcours commencent par le colis ou les kilos.
  it('aucun parcours de colis ou de kilos ne commence par les billets d’avion', () => {
    expect(travelerJourney[0]!.id).toBe('publish')
    for (const steps of [senderJourney, travelerJourney]) {
      expect(steps.map(step => step.id)).not.toContain('alert')
      expect(steps.map(step => step.id)).not.toContain('ticket')
    }
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

  // Sept étapes en quatre temps : chaque texte existant apparaît une fois dans
  // les temps ou dans « Vous gardez la main », sans en perdre ni en dupliquer.
  it('les quatre temps du voyageur et « Vous gardez la main » couvrent les sept étapes une seule fois', () => {
    expect(travelerTemps).toHaveLength(4)
    const used = [...travelerTemps.flatMap(temps => temps.steps), travelerControl.step].sort()
    expect(used).toEqual(travelerJourney.map((_, index) => index))
    for (const temps of travelerTemps) {
      expect(temps.steps).toContain(temps.visual)
      expect(travelerJourney[temps.visual]).toBeDefined()
    }
  })

  it('chaque temps a son titre dans les deux langues, et la question de la FAQ existe', () => {
    for (const messages of [fr, en]) {
      const traveler = messages.journeys.traveler as unknown as Record<string, Record<string, string> | unknown[]>
      for (const temps of travelerTemps) expect((traveler.temps as Record<string, string>)[temps.id], temps.id).toBeTruthy()
      expect((traveler.control as Record<string, string>).title).toBeTruthy()
      expect(traveler.faq[travelerControl.faq]).toBeDefined()
    }
  })
})
