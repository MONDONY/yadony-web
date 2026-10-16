<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { buildSeoMeta } from '@/lib/seo'
import { useInView } from '@/composables/useInView'
import { useTexts } from '@/composables/useTexts'

defineI18nRoute({ paths: { fr: '/tarifs', en: '/pricing' } })

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { items } = useTexts()

// Les trois formules du voyageur, mêmes cartes que sur l'accueil : elles se
// retournent quand elles entrent à l'écran.
const modes = items<{ title: string; example: string }>('landing.crossed.art.priceModes')
const modesEl = ref<HTMLElement | null>(null)
const { inView: modesShown } = useInView(modesEl, { once: true })

useSeoMeta(
  buildSeoMeta({
    title: t('pricing.seo.title'),
    description: t('pricing.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)
</script>

<template>
  <div>
    <PageHero :title="t('pricing.title')" :lead="t('pricing.lead')" pose="scale" :pose-alt="t('pricing.donyAlt')" />
    <UiSection tone="white">
      <UiContainer>
        <div class="grid items-start gap-10 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <PricingExample />
            <p class="mt-6 max-w-prose text-sm text-ink-muted">
              {{ t('pricing.cap') }}
            </p>
          </div>
          <UiReveal variant="right" class="rounded-card bg-sand p-8 lg:col-span-5">
            <h2 class="font-display text-2xl font-bold text-ink text-balance">{{ t('pricing.comparison.title') }}</h2>
            <p class="mt-4 text-ink-muted text-pretty">{{ t('pricing.comparison.text') }}</p>
          </UiReveal>
        </div>
      </UiContainer>
    </UiSection>

    <UiSection tone="sand">
      <UiContainer>
        <div class="grid items-center gap-12 lg:grid-cols-12">
          <div class="lg:col-span-6">
            <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-accent-text">{{ t('pricing.modes.kicker') }}</p>
            <h2 class="mt-4 max-w-[20ch] text-display-lg text-balance">{{ t('pricing.modes.title') }}</h2>
            <p class="mt-5 max-w-prose text-lg text-ink-muted text-pretty">{{ t('pricing.modes.lead') }}</p>
            <UiButton :to="localePath('/devenir-voyageur')" class="mt-8">{{ t('pricing.modes.cta') }}</UiButton>
          </div>
          <div ref="modesEl" class="flex justify-center lg:col-span-6">
            <ArtPriceModes :modes="modes" :flipped="modesShown" />
          </div>
        </div>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
