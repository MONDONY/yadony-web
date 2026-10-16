<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'

const { t } = useI18n()
const { list } = useTexts()
</script>

<template>
  <section class="overflow-hidden bg-bg py-14 sm:py-20">
    <UiContainer>
      <div class="max-w-2xl">
        <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent-text">{{ t('landing.payments.kicker') }}</p>
        <h2 class="mt-3 text-display-lg text-ink">{{ t('landing.payments.title') }}</h2>
        <p class="mt-5 text-lg text-ink-muted">{{ t('landing.payments.lead') }}</p>
      </div>
    </UiContainer>
    <div class="mt-10">
      <ArtPaymentMarquee :items="list('landing.payments.items')" />
    </div>
    <UiContainer>
      <p class="mt-8 max-w-2xl text-sm text-ink-muted">{{ t('landing.payments.note') }}</p>
    </UiContainer>
  </section>
</template>
