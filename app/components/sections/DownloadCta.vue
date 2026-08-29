<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <UiSection id="telecharger" tone="sand">
    <UiContainer>
      <div class="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 class="max-w-[16ch] text-display-lg">{{ t('home.download.title') }}</h2>
          <p class="mt-5 max-w-prose text-ink-muted">{{ t('home.download.text') }}</p>
          <StoreBadges size="lg" class="mt-9" />
        </div>
      </div>
    </UiContainer>
  </UiSection>
</template>
