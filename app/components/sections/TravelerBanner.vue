<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const localePath = useLocalePath()
const travelerCtaHref = localePath({ path: '/comment-ca-marche', query: { role: 'voyageur' } })
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <div class="rounded-card border border-line bg-sand-deep/40 px-8 py-14 sm:px-14">
        <h2 class="max-w-[24ch] text-display-md">{{ t('home.traveler.title') }}</h2>
        <p class="mt-5 max-w-prose text-ink-muted">{{ t('home.traveler.text') }}</p>
        <UiButton :to="travelerCtaHref" size="lg" class="mt-8">{{ t('home.traveler.cta') }}</UiButton>
      </div>
    </UiContainer>
  </UiSection>
</template>
