import { config } from '@vue/test-utils'

const passthrough = { template: '<div><slot /></div>' }

config.global.stubs = {
  NuxtLink: { name: 'NuxtLink', props: ['to'], template: '<a :href="to"><slot /></a>' },
  ClientOnly: passthrough,
  UiContainer: passthrough,
  UiSection: passthrough,
  UiRevealOnScroll: passthrough,
  // Reproduit le contrat réel du composant : une figure contenant l'image
  // avec ses dimensions intrinsèques, pour que les tests d'alt et de
  // dimensions continuent de vérifier le HTML effectivement servi.
  UiPhoneFrame: {
    name: 'UiPhoneFrame',
    props: ['src', 'alt', 'eager'],
    template: '<figure><img :src="src" :alt="alt" width="640" height="1385"></figure>',
  },
  StoreBadges: { template: '<div data-store-badges />' },
}
