<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BAREME, POINTS, TEST_GROUPS, type TestKey } from '@/lib/classement/bareme'

const { t, tm, rt, n } = useI18n()

const avant = computed(() =>
  (tm('contest.rules.before') as { title: unknown; text: unknown }[]).map(item => ({
    title: rt(item.title as never),
    text: rt(item.text as never),
  })),
)

function sousTitre(cle: TestKey): string | null {
  if (cle.startsWith('paiement_')) return t('contest.rules.paymentHint')
  if (cle.startsWith('absence_') || cle.startsWith('annulation_')) return t('contest.rules.comment')
  return null
}

const retours = computed(() => [
  { titre: t('contest.rules.avisEcran'), sous: t('contest.rules.avisEcranHint'), points: t('contest.rules.perScreen', { n: POINTS.avisEcran }) },
  { titre: t('contest.rules.suggestion'), sous: t('contest.rules.unlimited'), points: t('contest.rules.perIdea', { n: POINTS.suggestion }) },
  { titre: t('contest.rules.bugOther'), sous: t('contest.rules.unlimited'), points: t('contest.rules.perBug', { n: POINTS.bug }) },
])
</script>

<template>
  <section id="bareme" class="mb-14 mt-3 scroll-mt-4" aria-labelledby="rules-title" data-testid="contest-rules">
    <p class="font-display text-xs font-bold uppercase tracking-[0.18em] text-orange-deep">{{ t('contest.rules.eyebrow') }}</p>
    <h2 id="rules-title" class="mt-1.5 text-balance font-display text-display-md font-extrabold">{{ t('contest.rules.title') }}</h2>
    <p class="mt-1.5 max-w-prose text-ink-muted">{{ t('contest.rules.lead') }}</p>

    <div class="mt-5 grid gap-x-6 gap-y-3.5 rounded-card bg-navy px-5 py-5 text-white sm:grid-cols-3">
      <h3 class="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-orange sm:col-span-3">{{ t('contest.rules.beforeTitle') }}</h3>
      <div v-for="(item, i) in avant" :key="i" class="flex gap-3 text-sm text-white/85">
        <span class="grid h-7 w-7 flex-none place-items-center rounded-full bg-white/10 font-display font-extrabold text-orange" aria-hidden="true">{{ i + 1 }}</span>
        <span><b class="block text-white">{{ item.title }}</b>{{ item.text }}</span>
      </div>
    </div>

    <div class="mt-4 grid gap-3.5 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
      <div v-for="g in TEST_GROUPS" :key="g.id" data-testid="rules-group" class="min-w-0 rounded-card border border-line bg-surface px-5 pb-3 pt-4">
        <h3 class="mb-2 font-display text-base font-extrabold">{{ t(`contest.groups.${g.id}`) }}</h3>
        <div v-for="(cle, i) in g.tests" :key="cle" class="flex items-baseline justify-between gap-3.5 py-2 text-sm" :class="i > 0 ? 'border-t border-line' : ''">
          <span class="min-w-0">
            {{ t(`contest.tests.${cle}`) }}
            <small v-if="sousTitre(cle)" class="block text-[12.5px] text-ink-muted">{{ sousTitre(cle) }}</small>
          </span>
          <span class="flex-none whitespace-nowrap font-display text-sm font-extrabold tabular-nums text-orange-deep">{{ n(BAREME[cle]) }}</span>
        </div>
      </div>
      <div data-testid="rules-group" class="min-w-0 rounded-card border border-line bg-surface px-5 pb-3 pt-4">
        <h3 class="mb-2 font-display text-base font-extrabold">{{ t('contest.groups.retours') }}</h3>
        <div v-for="(r, i) in retours" :key="r.titre" class="flex items-baseline justify-between gap-3.5 py-2 text-sm" :class="i > 0 ? 'border-t border-line' : ''">
          <span class="min-w-0">{{ r.titre }}<small class="block text-[12.5px] text-ink-muted">{{ r.sous }}</small></span>
          <span class="flex-none whitespace-nowrap font-display text-sm font-extrabold tabular-nums text-orange-deep">{{ r.points }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13.5px] text-ink-muted">
      <span>{{ t('contest.rules.footer') }}</span>
      <a :href="t('contest.guideUrl')" target="_blank" rel="noopener" class="font-bold text-orange-deep underline-offset-2 hover:underline">{{ t('contest.rules.readGuide') }} ↗<span class="sr-only"> {{ t('contest.newTab') }}</span></a>
    </div>
  </section>
</template>
