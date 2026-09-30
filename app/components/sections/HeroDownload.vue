<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const stats = ['scans', 'identity', 'escrow'] as const
</script>

<template>
  <section
    class="relative overflow-hidden bg-navy-deep text-white"
    :style="{
      backgroundImage:
        'radial-gradient(1100px 520px at 82% -10%, rgb(246 146 30 / 0.22), transparent 60%),' +
        'radial-gradient(900px 600px at -10% 110%, rgb(24 43 92 / 0.9), transparent 65%),' +
        'linear-gradient(160deg, rgb(10 20 48) 0%, rgb(17 31 70) 55%, rgb(24 43 92) 100%)',
    }"
  >
    <UiContainer>
      <div class="grid items-center gap-14 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div class="lg:col-span-7">
          <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-orange">
            {{ t('home.hero.kicker') }}
          </p>
          <h1 class="mt-5 text-display-xl">{{ t('home.hero.title') }}</h1>
          <p class="mt-6 max-w-prose text-lg text-white/75">{{ t('home.hero.lead') }}</p>
          <StoreBadges size="lg" tone="dark" class="mt-9" />
          <p class="mt-5 text-sm text-white/60">{{ t('home.hero.note') }}</p>
        </div>

        <div class="lg:col-span-5">
          <div class="relative mx-auto w-[270px] sm:w-[300px] lg:-mr-16 lg:ml-auto lg:w-[330px] lg:rotate-[-3deg] xl:-mr-24">
            <UiPhoneVideo
              src="/video/yadony-promo.mp4"
              poster="/video/yadony-promo-poster.jpg"
              :description="t('home.hero.video.description')"
              :play-label="t('home.hero.video.play')"
              :pause-label="t('home.hero.video.pause')"
            />
          </div>
        </div>
      </div>

      <dl class="grid gap-8 border-t border-white/15 py-10 sm:grid-cols-3">
        <div v-for="stat in stats" :key="stat" class="flex flex-col">
          <dt class="order-2 text-sm text-white/70">{{ t(`home.hero.stats.${stat}.label`) }}</dt>
          <dd class="order-1 font-display text-3xl font-bold text-orange tabular-nums">
            {{ t(`home.hero.stats.${stat}.figure`) }}
          </dd>
        </div>
      </dl>
    </UiContainer>
  </section>
</template>
