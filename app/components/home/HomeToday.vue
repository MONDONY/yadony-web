<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'
import { proUrl } from '@/lib/site'

// « Yadony aujourd'hui » : tout ce que fait l'app, en une liste de six liens.
// Les cinq premiers mènent aux pages du site ; Yadony Pro vit sur son propre
// site, ouvert dans un nouvel onglet.
const { t } = useI18n()
const { items } = useTexts()
const localePath = useLocalePath()
const features = items<{ title: string; text: string }>('landing.today.items')
// Une entrée par fonction de l'app, dans l'ordre d'affichage : une page du
// site (avec une ancre éventuelle) ou un site externe (Yadony Pro).
type Target = { to: string; hash?: string } | { href: string; external: true }
const targets: Target[] = [
  { to: '/envoyer-colis' },
  { to: '/devenir-voyageur' },
  { to: '/billets-avion' },
  { to: '/comment-ca-marche' },
  { to: '/envoyer-colis', hash: '#destinataire' },
  { href: proUrl, external: true },
]

function isExternal(target: Target | undefined): boolean {
  return target !== undefined && 'external' in target
}

function href(target: Target): string {
  return 'external' in target ? target.href : `${localePath(target.to)}${target.hash ?? ''}`
}

const link =
  'group flex h-full min-h-11 flex-col rounded-card border border-line bg-surface p-6 transition-[border-color,background-color] duration-micro ease-dony ' +
  'hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
</script>

<template>
  <section class="bg-bg py-14 sm:py-20">
    <UiContainer>
      <h2 class="max-w-[20ch] text-display-lg text-ink">{{ t('landing.today.title') }}</h2>
      <p class="mt-3 max-w-[46ch] text-lg text-ink-muted">{{ t('landing.today.lead') }}</p>
      <ul class="mt-8 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="(feature, index) in features" :key="feature.title">
          <a
            v-if="isExternal(targets[index])"
            :href="href(targets[index]!)"
            target="_blank"
            rel="noopener noreferrer"
            :class="link"
          >
            <span class="font-display text-xl font-bold text-ink">{{ feature.title }}<span class="sr-only"> {{ t('a11y.opensNewTab') }}</span></span>
            <span class="mt-2 text-ink-muted">{{ feature.text }}</span>
          </a>
          <NuxtLink v-else :to="href(targets[index]!)" :class="link">
            <span class="font-display text-xl font-bold text-ink">{{ feature.title }}</span>
            <span class="mt-2 text-ink-muted">{{ feature.text }}</span>
          </NuxtLink>
        </li>
      </ul>
    </UiContainer>
  </section>
</template>
