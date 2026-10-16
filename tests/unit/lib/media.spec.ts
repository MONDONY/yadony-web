import { describe, expect, it } from 'vitest'
import {
  APP_SCREEN_IDS,
  DONY_POSE_IDS,
  appScreen,
  donyPose,
  srcset,
  IMAGE_WIDTHS,
} from '@/lib/media'

describe('registre des écrans de l’app', () => {
  it('résout chaque écran vers une image générée, au format portrait de l’iPhone', () => {
    for (const id of APP_SCREEN_IDS) {
      const image = appScreen(id)
      expect(image.base).toBe(`/img/app/${id}`)
      expect(image.width).toBe(1170)
      expect(image.height).toBeGreaterThan(2000)
    }
  })
})

describe('registre des poses de Dony', () => {
  it('résout chaque pose vers une image existante', () => {
    for (const id of DONY_POSE_IDS) {
      const image = donyPose(id)
      expect(image.base).toMatch(/^\/img\/dony\/[a-z-]+$/)
      expect(image.width).toBeGreaterThan(0)
    }
  })

  it('retombe sur une pose existante tant qu’une nouvelle pose n’est pas fournie', () => {
    // « price-alert » fait partie des poses demandées au propriétaire : tant
    // que le fichier n'existe pas, on affiche Dony à la loupe.
    expect(donyPose('price-alert').base).toBe('/img/dony/search')
    expect(donyPose('delivery').base).toBe('/img/dony/celebration')
  })

  it('utilise la pose elle-même quand elle existe', () => {
    expect(donyPose('hello').base).toBe('/img/dony/hello')
  })
})

describe('srcset', () => {
  it('liste les deux largeurs générées pour un format', () => {
    expect(srcset('/img/app/scan', 'avif', 'app')).toBe(
      `/img/app/scan-${IMAGE_WIDTHS.app[0]}.avif ${IMAGE_WIDTHS.app[0]}w, /img/app/scan-${IMAGE_WIDTHS.app[1]}.avif ${IMAGE_WIDTHS.app[1]}w`,
    )
  })
})
