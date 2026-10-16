<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInView } from '@/composables/useInView'
import { useTexts } from '@/composables/useTexts'

// Le destinataire : un message WhatsApp, puis la page de suivi sans compte.
const { t } = useI18n()
const { list } = useTexts()
const scene = ref<HTMLElement | null>(null)
const { inView } = useInView(scene, { once: true })
</script>

<template>
  <section class="bg-navy py-14 text-white sm:py-20">
    <UiContainer>
      <div class="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent">{{ t('landing.recipient.kicker') }}</p>
          <h2 class="mt-3 text-display-lg">{{ t('landing.recipient.title') }}</h2>
          <p class="mt-5 text-lg text-white/80">{{ t('landing.recipient.lead') }}</p>
          <ul class="mt-8 flex list-none flex-col gap-3">
            <li v-for="point in list('landing.recipient.points')" :key="point" class="flex gap-3 text-white/90">
              <svg viewBox="0 0 20 20" class="mt-1 size-5 shrink-0 text-accent" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m4 10.5 4 4 8-9" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ point }}
            </li>
          </ul>
        </div>
        <div ref="scene" class="mx-auto flex w-full max-w-md flex-col gap-4">
          <div
            class="max-w-[85%] self-end rounded-card rounded-br-[6px] bg-[#DCF8C6] px-4 py-3 text-ink shadow-md transition-[opacity,translate] duration-slow ease-dony"
            :class="inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
          >
            <p>{{ t('landing.recipient.chat.message') }}</p>
            <p class="mt-1 font-semibold text-primary underline">{{ t('landing.recipient.chat.link') }}</p>
          </div>
          <div
            class="rounded-sheet bg-surface p-6 text-ink shadow-xl transition-[opacity,translate] delay-500 duration-page ease-dony motion-reduce:delay-0"
            :class="inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
          >
            <p class="font-display text-xl font-bold">{{ t('landing.recipient.chat.page') }}</p>
            <p class="mt-1 text-sm text-ink-muted">{{ t('landing.recipient.chat.pageDetail') }}</p>
            <div class="mt-5">
              <ArtTrackingTimeline :labels="list('landing.crossed.art.timeline')" :progress="inView ? 2 : 0" class="!max-w-none !p-0 !shadow-none" />
            </div>
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
