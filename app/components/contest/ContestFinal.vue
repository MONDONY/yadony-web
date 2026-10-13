<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { classerFinal } from '@/lib/classement/final'
import ContestPodium from './ContestPodium.vue'

// Résultat final du concours : phase 1 + phase 2, podium, futurs actionnaires,
// gagnante de chaque phase, suite du top 10 et récompenses (formulations
// validées par le fondateur le 13/10/2026 : aucun montant, aucune condition).
const props = defineProps<{
  phase1: { id?: string; nom: string | null; score: number }[]
  phase2: { id: string; nom: string; total: number }[]
}>()
const { t, n } = useI18n()

const lignes = computed(() => classerFinal(props.phase1, props.phase2))
const gagnante = computed(() => lignes.value[0])
const top3 = computed(() => lignes.value.slice(0, 3))
const suite = computed(() => lignes.value.slice(3, 10))

const podium = computed(() =>
  top3.value.map((l, i) => ({
    id: `final-${i}`,
    nom: l.nom,
    total: l.total,
    rang: l.rang,
    sousTitre: t('contest.final.podiumSub', { p1: n(l.phase1), p2: n(l.phase2) }),
  })),
)

const prenoms = computed(() => top3.value.map(l => l.nom.split(' ')[0]))

const premiere1 = computed(() =>
  props.phase1.filter(p => p.nom).reduce<(typeof props.phase1)[number] | undefined>((m, p) => (!m || p.score > m.score ? p : m), undefined),
)
const premiere2 = computed(() =>
  props.phase2.reduce<(typeof props.phase2)[number] | undefined>((m, p) => (!m || p.total > m.total ? p : m), undefined),
)
</script>

<template>
  <section
    v-if="gagnante"
    data-testid="contest-final"
    aria-labelledby="final-title"
    class="relative -mt-12 rounded-card border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(10_20_48/0.06),0_12px_32px_-16px_rgb(10_20_48/0.25)] sm:p-8"
  >
    <p class="font-display text-xs font-bold uppercase tracking-[0.18em] text-orange-deep">{{ t('contest.final.eyebrow') }}</p>
    <h2 id="final-title" data-testid="final-title" class="mt-1.5 text-balance font-display text-display-md font-extrabold">
      {{ top3.length === 3 ? t('contest.final.title', { a: top3[0]!.nom, b: top3[1]!.nom, c: top3[2]!.nom }) : gagnante.nom }}
    </h2>
    <p class="mt-1.5 max-w-prose text-pretty text-ink-muted">{{ t('contest.final.lead') }}</p>

    <ContestPodium :lignes="podium" :chevauche="false" />

    <div
      v-if="prenoms.length === 3"
      data-testid="final-shareholders"
      class="mt-6 rounded-card bg-navy-deep p-5 text-white sm:p-6"
    >
      <p class="font-display text-xs font-bold uppercase tracking-[0.18em] text-orange">{{ t('contest.final.shareholdersTitle') }}</p>
      <p class="mt-2 max-w-prose text-pretty text-[16px] leading-relaxed sm:text-[17px]">
        {{ t('contest.final.shareholdersText', { a: prenoms[0], b: prenoms[1], c: prenoms[2] }) }}
      </p>
      <p class="mt-2 text-[13px] text-white/70">{{ t('contest.final.shareholdersNote') }}</p>
    </div>

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <div v-if="premiere1?.nom" data-testid="final-phase1" class="min-w-0 rounded-card border border-line p-4">
        <p class="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">{{ t('contest.final.phase1Label') }}</p>
        <p class="mt-1 font-display text-lg font-bold">{{ premiere1.nom }}</p>
        <p class="tabular-nums text-ink-muted">{{ n(Math.round(premiere1.score)) }} {{ t('contest.points') }}</p>
      </div>
      <div v-if="premiere2" data-testid="final-phase2" class="min-w-0 rounded-card border border-line p-4">
        <p class="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">{{ t('contest.final.phase2Label') }}</p>
        <p class="mt-1 font-display text-lg font-bold">{{ premiere2.nom }}</p>
        <p class="tabular-nums text-ink-muted">{{ n(premiere2.total) }} {{ t('contest.points') }}</p>
      </div>
    </div>

    <template v-if="suite.length">
      <h3 class="mt-7 font-display text-[13px] font-bold uppercase tracking-[0.12em] text-ink-muted">{{ t('contest.final.restTitle') }}</h3>
      <ol class="mt-2 divide-y divide-line rounded-card border border-line">
        <li
          v-for="l in suite"
          :key="l.nom + l.rang"
          data-testid="final-row"
          class="flex items-center gap-3 px-3.5 py-2.5 tabular-nums"
        >
          <span class="w-6 shrink-0 font-display font-extrabold text-ink-muted">{{ l.rang }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold">{{ l.nom }}</span>
            <span class="block text-[12px] text-ink-muted">{{ t('contest.final.podiumSub', { p1: n(l.phase1), p2: n(l.phase2) }) }}</span>
          </span>
          <span class="font-display font-extrabold">{{ n(l.total) }}</span>
        </li>
      </ol>
    </template>

    <div data-testid="final-rewards" class="mt-6 rounded-card bg-sand p-4 sm:p-5">
      <p class="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-orange-deep">{{ t('contest.final.rewardsTitle') }}</p>
      <p class="mt-1.5 max-w-prose text-pretty">{{ t('contest.final.rewardsText') }}</p>
    </div>
  </section>
</template>
