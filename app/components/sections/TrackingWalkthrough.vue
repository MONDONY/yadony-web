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
  <UiSection tone="navy-deep">
    <UiContainer>
      <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-orange">
        {{ t('home.tracking.kicker') }}
      </p>
      <h2 class="mt-4 max-w-[18ch] text-display-lg">{{ t('home.tracking.title') }}</h2>
      <p class="mt-5 max-w-prose text-lg text-white/70">{{ t('home.tracking.lead') }}</p>
    </UiContainer>

    <ol
      class="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-12"
      tabindex="0"
      :aria-label="t('home.tracking.scrollLabel')"
    >
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        class="w-[248px] shrink-0 snap-start list-none sm:w-[272px]"
      >
        <UiRevealOnScroll :delay="index * 100">
          <article data-step>
            <UiPhoneFrame :src="step.image" :alt="t(`home.tracking.steps.${step.key}.alt`)" />
            <p data-step-number class="mt-5 font-display text-sm font-bold text-orange tabular-nums">
              {{ step.number }}
            </p>
            <h3 class="mt-1 font-display text-lg font-semibold text-white">
              {{ t(`home.tracking.steps.${step.key}.label`) }}
            </h3>
            <p class="mt-2 text-sm text-white/70">
              {{ t(`home.tracking.steps.${step.key}.text`) }}
            </p>
          </article>
        </UiRevealOnScroll>
      </li>
    </ol>
  </UiSection>
</template>
