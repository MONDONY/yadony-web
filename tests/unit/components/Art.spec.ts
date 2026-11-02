import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ArtNegotiation from '@/components/art/ArtNegotiation.vue'
import ArtTrackingTimeline from '@/components/art/ArtTrackingTimeline.vue'
import ArtPadlock from '@/components/art/ArtPadlock.vue'
import ArtPriceModes from '@/components/art/ArtPriceModes.vue'

const negotiation = {
  sender: 'Moussa', traveler: 'Awa',
  messages: ['Je propose 60 €', 'Contre-offre : 70 €', 'On dit 65 € ?'],
  agreed: 'Accord à 65 €',
}

describe('ArtNegotiation', () => {
  it('révèle les bulles une à une selon l’étape', () => {
    const wrapper = mount(ArtNegotiation, { props: { ...negotiation, step: 1 } })
    const bubbles = wrapper.findAll('[data-bubble]')
    expect(bubbles.map(bubble => bubble.attributes('data-shown'))).toEqual(['true', 'true', 'false'])
    expect(wrapper.get('[data-agreed]').attributes('data-shown')).toBe('false')
  })

  it('affiche l’accord à la dernière étape', () => {
    const wrapper = mount(ArtNegotiation, { props: { ...negotiation, step: 3 } })
    expect(wrapper.get('[data-agreed]').attributes('data-shown')).toBe('true')
    expect(wrapper.text()).toContain('Accord à 65 €')
  })
})

describe('ArtTrackingTimeline', () => {
  it('marque les jalons atteints', () => {
    const wrapper = mount(ArtTrackingTimeline, {
      props: { labels: ['Remis', 'En vol', 'Arrivé', 'Livré'], progress: 2 },
    })
    expect(wrapper.findAll('[data-done="true"]')).toHaveLength(3)
    expect(wrapper.get('[data-fill]').attributes('style')).toContain('66.6')
  })
})

describe('ArtPadlock', () => {
  it('passe de verrouillé à ouvert', () => {
    const locked = mount(ArtPadlock, { props: { locked: true, amount: '65 €', caption: 'Bloqué' } })
    expect(locked.get('svg').attributes('data-locked')).toBe('true')
    const open = mount(ArtPadlock, { props: { locked: false, amount: '65 €', caption: 'Versé' } })
    expect(open.get('svg').attributes('data-locked')).toBe('false')
    expect(open.text()).toContain('Versé')
  })
})

describe('ArtPriceModes', () => {
  it('rend les trois formules, recto et verso lisibles dans le DOM', () => {
    const modes = [
      { title: 'Au kilo', example: '8 €/kg' },
      { title: 'Négociable', example: 'Fais-moi une offre' },
      { title: 'Par article', example: 'Téléphone 20 €' },
    ]
    const wrapper = mount(ArtPriceModes, { props: { modes, flipped: true } })
    expect(wrapper.findAll('[data-mode]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Téléphone 20 €')
    expect(wrapper.get('[data-mode]').attributes('data-flipped')).toBe('true')
  })
})
