<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section
    id="telecharger"
    class="relative overflow-hidden bg-navy-deep py-20 text-white sm:py-28"
    :style="{
      backgroundImage:
        'radial-gradient(900px 460px at 15% -20%, rgb(246 146 30 / 0.18), transparent 60%),' +
        'linear-gradient(200deg, rgb(10 20 48) 0%, rgb(20 36 78) 100%)',
    }"
  >
    <UiContainer>
      <div class="grid items-center gap-12 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <!-- Un QR code vers l'app viendra ici une fois les URL réelles des
               fiches App Store et Play Store connues (colonne réservée par le
               porteur de contenu). -->
          <h2 class="max-w-[16ch] text-display-lg">{{ t('home.download.title') }}</h2>
          <p class="mt-5 max-w-prose text-white/70">{{ t('home.download.text') }}</p>
          <StoreBadges size="lg" tone="dark" class="mt-9" />
        </div>
        <div class="hidden lg:col-span-5 lg:block">
          <div class="w-[260px] rotate-[3deg] lg:ml-auto lg:mr-6">
            <UiPhoneFrame
              src="/screenshots/app-depot.webp"
              :alt="t('home.download.screenshotAlt')"
            />
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
