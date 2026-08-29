<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const steps = [
  { key: 'deposit', number: '01', image: '/screenshots/app-depot.webp' },
  { key: 'airport', number: '02', image: '/screenshots/app-scan.webp' },
  { key: 'transit', number: '03', image: '/screenshots/app-transit.webp' },
  { key: 'delivery', number: '04', image: '/screenshots/app-livraison.webp' },
] as const
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h2 class="max-w-[18ch] text-display-lg">{{ t('home.tracking.title') }}</h2>
      <p class="mt-5 max-w-prose text-lg text-ink-muted">{{ t('home.tracking.lead') }}</p>
    </UiContainer>

    <div
      class="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-12"
      role="list"
    >
      <UiRevealOnScroll
        v-for="step in steps"
        :key="step.key"
        class="w-[268px] shrink-0 snap-start sm:w-[300px]"
      >
        <article data-step role="listitem">
          <img
            :src="step.image"
            :alt="t(`home.tracking.steps.${step.key}.alt`)"
            width="1170"
            height="2532"
            loading="lazy"
            decoding="async"
            class="w-full rounded-card border border-line bg-sand"
          >
          <p data-step-number class="mt-5 font-display text-sm font-bold text-terra tabular-nums">
            {{ step.number }}
          </p>
          <h3 class="mt-1 font-display text-lg font-semibold">
            {{ t(`home.tracking.steps.${step.key}.label`) }}
          </h3>
          <p class="mt-2 text-sm text-ink-muted">
            {{ t(`home.tracking.steps.${step.key}.text`) }}
          </p>
        </article>
      </UiRevealOnScroll>
    </div>
  </UiSection>
</template>
