<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section id="en-une-minute" class="scroll-mt-24 bg-navy-deep py-14 text-white sm:py-20">
    <UiContainer>
      <div class="grid items-center gap-12 lg:grid-cols-12">
        <div class="lg:col-span-6">
          <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent">{{ t('landing.video.kicker') }}</p>
          <h2 class="mt-3 text-display-lg">{{ t('landing.video.title') }}</h2>
          <p class="mt-5 max-w-prose text-lg text-white/75">{{ t('landing.video.lead') }}</p>
        </div>
        <div class="lg:col-span-6">
          <UiReveal variant="scale" class="mx-auto w-[260px] sm:w-[300px]">
            <UiPhoneVideo
              src="/video/yadony-en-une-minute.mp4"
              poster="/video/yadony-en-une-minute-poster.jpg"
              :description="t('landing.video.description')"
              :play-label="t('landing.video.play')"
              :pause-label="t('landing.video.pause')"
              :autoplay="false"
            />
          </UiReveal>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
