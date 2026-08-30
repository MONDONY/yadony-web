<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const localePath = useLocalePath()
const travelerCtaHref = localePath({ path: '/comment-ca-marche', query: { role: 'voyageur' } })
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <div
        class="overflow-hidden rounded-card bg-orange px-8 py-14 text-navy-deep sm:px-14"
        :style="{
          backgroundImage:
            'radial-gradient(700px 340px at 90% -20%, rgb(255 255 255 / 0.28), transparent 60%)',
        }"
      >
        <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-navy-deep/70">
          {{ t('home.traveler.kicker') }}
        </p>
        <h2 class="mt-4 max-w-[24ch] text-display-md">{{ t('home.traveler.title') }}</h2>
        <p class="mt-5 max-w-prose text-navy-deep/80">{{ t('home.traveler.text') }}</p>
        <UiButton :to="travelerCtaHref" size="lg" variant="navy" class="mt-8">
          {{ t('home.traveler.cta') }}
        </UiButton>
      </div>
    </UiContainer>
  </UiSection>
</template>
