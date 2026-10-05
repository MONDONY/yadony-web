<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MarchePodium } from '@/lib/classement/types'

const props = withDefaults(
  defineProps<{ lignes: MarchePodium[]; chevauche?: boolean }>(),
  { chevauche: true },
)
const { t, n } = useI18n()

// `place` = position (1er, 2e, 3e) : fixe la colonne et le style de la marche.
// La médaille affiche le rang, partagé par les ex æquo (1, 1, 3).
// Ordre visuel 2-1-3 à toutes les tailles : sur téléphone aussi, les trois
// marches restent côte à côte, en version compacte.
const marches = computed(() =>
  [1, 0, 2]
    .map(i => ({ ligne: props.lignes[i], place: i + 1 }))
    .filter((m): m is { ligne: MarchePodium; place: number } => Boolean(m.ligne)),
)

const colonnes: Record<number, string> = { 1: 'col-start-2', 2: 'col-start-1', 3: 'col-start-3' }

const styles: Record<number, { medal: string; card: string; name: string; pts: string }> = {
  1: {
    medal: 'h-10 w-10 bg-orange text-lg sm:h-12 sm:w-12 sm:text-[21px]',
    card: 'border-orange pt-5 pb-4 sm:pt-7 sm:pb-6',
    name: 'text-[15px] sm:text-[21px]',
    pts: 'text-[26px] text-orange-deep sm:text-[38px]',
  },
  2: {
    medal: 'h-8 w-8 bg-[rgb(150_160_178)] text-[15px] sm:h-10 sm:w-10 sm:text-lg',
    card: 'pt-3.5 pb-3.5 sm:pt-5 sm:pb-5',
    name: 'text-[13.5px] sm:text-lg',
    pts: 'text-xl sm:text-[30px]',
  },
  3: {
    medal: 'h-8 w-8 bg-[rgb(178_110_60)] text-[15px] sm:h-10 sm:w-10 sm:text-lg',
    card: 'pt-3.5 pb-3.5 sm:pt-5 sm:pb-5',
    name: 'text-[13.5px] sm:text-lg',
    pts: 'text-xl sm:text-[30px]',
  },
}
</script>

<template>
  <section
    v-if="marches.length"
    data-testid="podium"
    class="relative grid grid-cols-[1fr_1.12fr_1fr] items-end gap-2 sm:gap-3.5"
    :class="chevauche ? '-mt-16' : 'mt-5'"
    :aria-label="t('contest.podium')"
  >
    <div
      v-for="m in marches"
      :key="m.ligne.id"
      data-testid="podium-step"
      :data-rank="m.place"
      class="min-w-0 rounded-card border border-line bg-surface px-2 text-center sm:px-4 shadow-[0_1px_2px_rgb(10_20_48/0.06),0_12px_32px_-16px_rgb(10_20_48/0.25)]"
      :class="[styles[m.place]!.card, colonnes[m.place], 'row-start-1']"
    >
      <div
        data-testid="podium-medal"
        class="mx-auto mb-2 grid place-items-center rounded-full font-display font-extrabold text-white"
        :class="styles[m.place]!.medal"
        aria-hidden="true"
      >
        {{ m.ligne.rang }}
      </div>
      <div data-testid="podium-name" class="line-clamp-2 text-balance break-words font-display font-bold leading-tight" :class="styles[m.place]!.name">
        {{ m.ligne.nom }}
      </div>
      <div class="mt-0.5 font-display font-extrabold tabular-nums tracking-tight" :class="styles[m.place]!.pts">
        {{ n(m.ligne.total) }}<small class="ml-0.5 text-xs font-semibold sm:ml-1 sm:text-sm tracking-normal text-ink-muted">{{ t('contest.points') }}</small>
      </div>
      <div class="text-pretty text-[11px] leading-snug text-ink-muted sm:text-[13px]">
        {{ m.ligne.sousTitre ?? t('contest.testsDone', m.ligne.nbTests ?? 0) }}
      </div>
    </div>
  </section>
</template>
