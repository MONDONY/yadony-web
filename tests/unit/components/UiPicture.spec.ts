import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UiPicture from '@/components/ui/UiPicture.vue'
import { appScreen, donyPose } from '@/lib/media'

describe('UiPicture', () => {
  it('sert l’AVIF puis le WebP, avec dimensions intrinsèques et alt', () => {
    const wrapper = mount(UiPicture, { props: { image: appScreen('scan'), alt: 'Écran Suivi', sizes: '300px' } })
    const sources = wrapper.findAll('source')
    expect(sources.map(source => source.attributes('type'))).toEqual(['image/avif', 'image/webp'])
    expect(sources[0]!.attributes('srcset')).toContain('/img/app/scan-480.avif 480w')
    const img = wrapper.get('img')
    expect(img.attributes('alt')).toBe('Écran Suivi')
    expect(img.attributes('width')).toBe('1170')
    expect(img.attributes('src')).toBe('/img/app/scan-960.webp')
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('charge en priorité l’image du haut de page', () => {
    const wrapper = mount(UiPicture, { props: { image: donyPose('hello'), alt: '', eager: true } })
    const img = wrapper.get('img')
    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('fetchpriority')).toBe('high')
  })
})
