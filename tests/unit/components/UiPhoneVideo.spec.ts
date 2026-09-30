import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import UiPhoneVideo from '@/components/ui/UiPhoneVideo.vue'

const props = {
  src: '/video/yadony-promo.mp4',
  poster: '/video/yadony-promo-poster.jpg',
  description: 'Présentation de l’application',
  playLabel: 'Lire la vidéo',
  pauseLabel: 'Mettre la vidéo en pause',
}

function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce && query.includes('reduce'), media: query }))
}

describe('UiPhoneVideo', () => {
  let play: ReturnType<typeof vi.fn>
  let pause: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // happy-dom n'implémente pas la lecture : play/pause émettent les
    // événements qu'un vrai navigateur émettrait.
    play = vi.fn(function (this: HTMLVideoElement) {
      this.dispatchEvent(new Event('play'))
      return Promise.resolve()
    })
    pause = vi.fn(function (this: HTMLVideoElement) {
      this.dispatchEvent(new Event('pause'))
    })
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause)
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'complete' })
    stubMatchMedia(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  /**
   * Sans `muted` et `playsinline` dans le HTML servi, Safari iOS refuse la
   * lecture automatique ou ouvre la vidéo en plein écran.
   */
  it('sert une vidéo muette, en boucle et en ligne, avec son poster', () => {
    const video = mount(UiPhoneVideo, { props }).find('video')
    expect(video.attributes()).toMatchObject({ loop: '', playsinline: '', preload: 'none', poster: props.poster })
    expect((video.element as HTMLVideoElement).muted).toBe(true)
  })

  it('attache la source et lance la lecture une fois la page chargée', async () => {
    const wrapper = mount(UiPhoneVideo, { props })
    await flushPromises()
    expect(wrapper.find('video').attributes('src')).toBe(props.src)
    expect(play).toHaveBeenCalledOnce()
    expect(wrapper.find('button').attributes('aria-label')).toBe(props.pauseLabel)
  })

  it('attend l’événement load quand la page charge encore', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
    const wrapper = mount(UiPhoneVideo, { props })
    await flushPromises()
    expect(wrapper.find('video').attributes('src')).toBeUndefined()

    window.dispatchEvent(new Event('load'))
    await flushPromises()
    expect(wrapper.find('video').attributes('src')).toBe(props.src)
    expect(play).toHaveBeenCalledOnce()
  })

  it('ne démarre pas seule quand le visiteur demande moins d’animations', async () => {
    stubMatchMedia(true)
    const wrapper = mount(UiPhoneVideo, { props })
    await flushPromises()
    expect(play).not.toHaveBeenCalled()
    expect(wrapper.find('video').attributes('src')).toBeUndefined()
    expect(wrapper.find('button').attributes('aria-label')).toBe(props.playLabel)

    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('video').attributes('src')).toBe(props.src)
    expect(play).toHaveBeenCalledOnce()
  })

  it('met en pause puis relance au bouton', async () => {
    const wrapper = mount(UiPhoneVideo, { props })
    await flushPromises()
    const button = wrapper.find('button')

    await button.trigger('click')
    expect(pause).toHaveBeenCalledOnce()
    expect(button.attributes('aria-label')).toBe(props.playLabel)

    await button.trigger('click')
    await flushPromises()
    expect(play).toHaveBeenCalledTimes(2)
    expect(button.attributes('aria-label')).toBe(props.pauseLabel)
  })

  it('garde le bouton de lecture quand le navigateur refuse la lecture', async () => {
    play.mockImplementation(() => Promise.reject(new DOMException('refus', 'NotAllowedError')))
    const wrapper = mount(UiPhoneVideo, { props })
    await flushPromises()
    expect(wrapper.find('button').attributes('aria-label')).toBe(props.playLabel)
  })

  /**
   * La vidéo est décorative pour un lecteur d'écran (sous-titres incrustés,
   * aucune piste audio) : son contenu est résumé dans la légende.
   */
  it('décrit la vidéo dans une légende lue par les lecteurs d’écran', () => {
    const wrapper = mount(UiPhoneVideo, { props })
    expect(wrapper.find('video').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('figcaption').text()).toBe(props.description)
  })
})
