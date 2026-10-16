<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { donyPose } from '@/lib/media'

// Dernier appel à télécharger, en bas de chaque page (ancre #telecharger,
// visée par le bouton « Télécharger » de l'en-tête).
const { t } = useI18n()
</script>

<template>
  <section id="telecharger" class="scroll-mt-24 overflow-hidden bg-navy-deep py-20 text-white sm:py-28">
    <UiContainer>
      <div class="grid items-center gap-12 lg:grid-cols-12">
        <div class="relative lg:col-span-7">
          <UiPicture
            :image="donyPose('celebration')"
            :alt="t('landing.final.donyAlt')"
            sizes="176px"
            class="animate-float mb-8 w-36 sm:w-44 [&_img]:h-auto [&_img]:w-full"
          />
          <h2 class="max-w-[18ch] text-display-lg">{{ t('landing.final.title') }}</h2>
          <p class="mt-5 max-w-prose text-lg text-white/75">{{ t('landing.final.lead') }}</p>
          <StoreBadges size="lg" tone="dark" class="mt-9" />
        </div>
        <div class="lg:col-span-5">
          <UiReveal variant="scale" class="mx-auto w-[240px] sm:w-[270px] lg:mr-6 lg:rotate-[3deg]">
            <UiPhoneVideo
              src="/video/yadony-promo.mp4"
              poster="/video/yadony-promo-poster.jpg"
              :description="t('landing.final.video.description')"
              :play-label="t('landing.final.video.play')"
              :pause-label="t('landing.final.video.pause')"
              :autoplay="false"
            />
          </UiReveal>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
