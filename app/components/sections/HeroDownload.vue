<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden bg-surface">
    <UiContainer>
      <div class="grid items-center gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div class="lg:col-span-7">
          <h1 class="text-display-xl">{{ t('home.hero.title') }}</h1>
          <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('home.hero.lead') }}</p>
          <StoreBadges size="lg" class="mt-9" />
          <p class="mt-5 text-sm text-ink-muted">{{ t('home.hero.note') }}</p>
        </div>

        <div class="lg:col-span-5">
          <div class="relative lg:-mr-24 xl:-mr-40">
            <img
              src="/screenshots/app-accueil.webp"
              :alt="t('home.hero.screenshotAlt')"
              width="1170"
              height="2532"
              class="mx-auto w-[260px] rounded-card border border-line bg-sand lg:w-[320px]"
              loading="eager"
              fetchpriority="high"
            >
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
