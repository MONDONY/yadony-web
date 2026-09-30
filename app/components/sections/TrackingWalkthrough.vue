<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const steps = [
  { key: 'deposit', number: '01', image: '/screenshots/suivi-01-remis.webp' },
  { key: 'airport', number: '02', image: '/screenshots/suivi-02-scan.webp' },
  { key: 'transit', number: '03', image: '/screenshots/suivi-03-en-route.webp' },
  { key: 'delivery', number: '04', image: '/screenshots/suivi-04-livre.webp' },
] as const
</script>

<template>
  <UiSection tone="navy-deep">
    <UiContainer>
      <div class="mx-auto max-w-3xl text-center">
        <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-orange">
          {{ t('home.tracking.kicker') }}
        </p>
        <h2 class="mx-auto mt-4 max-w-[20ch] text-display-lg text-balance">{{ t('home.tracking.title') }}</h2>
        <p class="mx-auto mt-5 max-w-prose text-lg text-white/70 text-pretty">{{ t('home.tracking.lead') }}</p>
      </div>
    </UiContainer>

    <ol
      class="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 [justify-content:safe_center] sm:px-8 lg:px-12"
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
            <p data-step-number class="mt-5 text-center font-display text-sm font-bold text-orange tabular-nums">
              {{ step.number }}
            </p>
            <h3 class="mt-1 text-center font-display text-lg font-semibold text-white">
              {{ t(`home.tracking.steps.${step.key}.label`) }}
            </h3>
            <p class="mt-2 text-center text-sm text-white/70 text-pretty">
              {{ t(`home.tracking.steps.${step.key}.text`) }}
            </p>
          </article>
        </UiRevealOnScroll>
      </li>
    </ol>
  </UiSection>
</template>
