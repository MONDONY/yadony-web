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

      <dl class="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-0">
        <div
          v-for="(pillar, index) in pillars"
          :key="pillar"
          class="sm:px-8"
          :class="index > 0 ? 'sm:border-l sm:border-line' : 'sm:pl-0'"
        >
          <dt>
            <p class="font-display text-4xl font-bold tabular-nums" :class="pillar === 'escrow' ? 'text-terra' : 'text-ink'">
              {{ t(`home.trust.${pillar}.figure`) }}
            </p>
            <span class="mt-3 block font-display text-lg font-semibold">{{ t(`home.trust.${pillar}.label`) }}</span>
          </dt>
          <dd class="mt-2 text-sm text-ink-muted">{{ t(`home.trust.${pillar}.text`) }}</dd>
        </div>
      </dl>
    </UiContainer>
  </UiSection>
</template>
