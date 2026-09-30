<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <UiSection tone="sand">
    <UiContainer>
      <div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-7">
          <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-navy">
            {{ t('howItWorks.intro.kicker') }}
          </p>
          <h2 class="mt-4 max-w-[20ch] text-display-lg text-balance">{{ t('howItWorks.intro.title') }}</h2>
          <p class="mt-5 max-w-prose text-lg text-ink-muted text-pretty">{{ t('howItWorks.intro.lead') }}</p>
        </div>
        <div class="lg:col-span-5">
          <div class="mx-auto w-[260px] sm:w-[290px]">
            <UiPhoneVideoPlayer
              src="/video/yadony-en-une-minute.mp4"
              poster="/video/yadony-en-une-minute-poster.jpg"
              :label="t('howItWorks.intro.videoLabel')"
            />
          </div>
        </div>
      </div>
    </UiContainer>
  </UiSection>
</template>
