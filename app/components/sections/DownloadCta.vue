<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <UiSection id="telecharger" tone="sand">
    <UiContainer>
      <!-- Un QR code vers l'app viendra ici une fois les URL réelles des
           fiches App Store et Play Store connues (colonne réservée par le
           porteur de contenu). -->
      <div class="max-w-xl">
        <h2 class="max-w-[16ch] text-display-lg">{{ t('home.download.title') }}</h2>
        <p class="mt-5 max-w-prose text-ink-muted">{{ t('home.download.text') }}</p>
        <StoreBadges size="lg" class="mt-9" />
      </div>
    </UiContainer>
  </UiSection>
</template>
