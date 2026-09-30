import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import JourneySteps from '@/components/sections/JourneySteps.vue'
import UiPhoneVideoPlayer from '@/components/ui/UiPhoneVideoPlayer.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

function mountSteps(role: 'expediteur' | 'voyageur') {
  return mount(JourneySteps, {
    props: { role },
    global: { plugins: [i18n], components: { UiPhoneVideoPlayer } },
  })
}

describe('JourneySteps', () => {
  it('rend les étapes du parcours choisi', () => {
    expect(mountSteps('voyageur').findAll('ol > li')).toHaveLength(fr.howItWorks.voyageur.steps.length)
  })

  it.each([
    ['expediteur', 'tuto-envoyer-colis', fr.howItWorks.expediteur.video],
    ['voyageur', 'tuto-publier-trajet', fr.howItWorks.voyageur.video],
  ] as const)('associe au parcours %s son tutoriel', (role, file, texts) => {
    const aside = mountSteps(role).find('[data-tutorial]')
    expect(aside.text()).toContain(texts.title)
    const video = aside.find('video')
    expect(video.attributes('src')).toBe(`/video/${file}.mp4`)
    expect(video.attributes('poster')).toBe(`/video/${file}-poster.jpg`)
    expect(video.attributes('aria-label')).toBe(texts.label)
  })

  /**
   * Ces vidéos ont du son : elles ne démarrent qu'au geste du visiteur, et
   * rien n'est téléchargé avant (plusieurs Mo par tutoriel).
   */
  it('ne lance ni ne précharge le tutoriel', () => {
    const video = mountSteps('expediteur').find('video')
    expect(video.attributes()).toMatchObject({ controls: '', playsinline: '', preload: 'none' })
    expect(video.attributes('autoplay')).toBeUndefined()
  })
})
