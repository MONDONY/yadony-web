import { config } from '@vue/test-utils'

const passthrough = { template: '<div><slot /></div>' }

config.global.stubs = {
  NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  ClientOnly: passthrough,
  UiContainer: passthrough,
  UiSection: passthrough,
  UiRevealOnScroll: passthrough,
  StoreBadges: { template: '<div data-store-badges />' },
}
