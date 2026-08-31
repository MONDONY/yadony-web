<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const pillars = ['identity', 'escrow', 'insurance'] as const
</script>

<template>
  <UiSection tone="sand">
    <UiContainer>
      <h2 class="max-w-[22ch] text-display-lg">{{ t('home.trust.title') }}</h2>
      <p class="mt-5 max-w-prose text-lg text-ink-muted">{{ t('home.trust.lead') }}</p>

      <ul class="mt-14 grid list-none gap-6 sm:grid-cols-3">
        <li v-for="(pillar, index) in pillars" :key="pillar">
          <UiRevealOnScroll :delay="index * 100" class="h-full">
            <article class="h-full rounded-card bg-surface p-8 shadow-[0_1px_2px_rgb(10_37_64/0.06),0_8px_24px_-12px_rgb(10_37_64/0.12)]">
              <p class="font-display text-5xl font-bold tabular-nums" :class="pillar === 'escrow' ? 'text-orange-deep' : 'text-navy'">
                {{ t(`home.trust.${pillar}.figure`) }}
              </p>
              <h3 class="mt-4 font-display text-lg font-semibold">{{ t(`home.trust.${pillar}.label`) }}</h3>
              <p class="mt-2 text-sm text-ink-muted">{{ t(`home.trust.${pillar}.text`) }}</p>
            </article>
          </UiRevealOnScroll>
        </li>
      </ul>
    </UiContainer>
  </UiSection>
</template>
