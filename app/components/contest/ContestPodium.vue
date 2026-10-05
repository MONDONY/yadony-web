<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LigneClassement } from '@/lib/classement/score'

const props = defineProps<{ lignes: LigneClassement[] }>()
const { t, n } = useI18n()

// Ordre visuel 2-1-3 sur grand écran ; sur mobile, `order` remet le 1er en tête.
const marches = computed(() =>
  [1, 0, 2]
    .map(i => ({ ligne: props.lignes[i], place: i + 1 }))
    .filter((m): m is { ligne: LigneClassement; place: number } => Boolean(m.ligne)),
)

const styles: Record<number, { medal: string; card: string; name: string; pts: string }> = {
  1: {
    medal: 'h-12 w-12 bg-orange text-[21px]',
    card: 'border-orange pt-7 pb-6 max-sm:order-first',
    name: 'text-[21px]',
    pts: 'text-[38px] text-orange-deep',
  },
  2: { medal: 'h-10 w-10 bg-[rgb(150_160_178)] text-lg', card: 'pt-5 pb-5', name: 'text-lg', pts: 'text-[30px]' },
  3: { medal: 'h-10 w-10 bg-[rgb(178_110_60)] text-lg', card: 'pt-5 pb-5', name: 'text-lg', pts: 'text-[30px]' },
}
</script>

<template>
  <section
    v-if="marches.length"
    class="relative -mt-16 grid items-end gap-3.5 sm:grid-cols-[1fr_1.12fr_1fr]"
    :aria-label="t('contest.podium')"
  >
    <div
      v-for="m in marches"
      :key="m.ligne.id"
      data-testid="podium-step"
      :data-rank="m.place"
      class="rounded-card border border-line bg-surface px-4 text-center shadow-[0_1px_2px_rgb(10_20_48/0.06),0_12px_32px_-16px_rgb(10_20_48/0.25)]"
      :class="styles[m.place]!.card"
    >
      <div
        class="mx-auto mb-2.5 grid place-items-center rounded-full font-display font-extrabold text-white"
        :class="styles[m.place]!.medal"
        aria-hidden="true"
      >
        {{ m.place }}
      </div>
      <div data-testid="podium-name" class="font-display font-bold" :class="styles[m.place]!.name">
        {{ m.ligne.nom }}
      </div>
      <div class="mt-0.5 font-display font-extrabold tabular-nums tracking-tight" :class="styles[m.place]!.pts">
        {{ n(m.ligne.total) }}<small class="ml-1 text-sm font-semibold tracking-normal text-ink-muted">{{ t('contest.points') }}</small>
      </div>
      <div class="text-[13px] text-ink-muted">
        {{ t('contest.testsDone', m.ligne.testsValides.length) }}
      </div>
    </div>
  </section>
</template>
