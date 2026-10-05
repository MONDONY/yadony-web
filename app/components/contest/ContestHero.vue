<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { joursRestants, localeDates, progression, statutPeriode } from '@/lib/classement/score'

const props = defineProps<{ debut: string; fin: string; maintenant: Date }>()
const { t, locale } = useI18n()

const statut = computed(() => statutPeriode(props.debut, props.fin, props.maintenant))
const avance = computed(() => Math.round(progression(props.debut, props.fin, props.maintenant) * 100))
const jours = computed(() => joursRestants(props.fin, props.maintenant))

function date(iso: string): string {
  return new Intl.DateTimeFormat(localeDates(locale.value), {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(iso))
}

const pastille: Record<string, string> = {
  bientot: 'bg-orange',
  en_cours: 'bg-[rgb(80_220_150)] motion-safe:animate-pulse',
  termine: 'bg-white/50',
}
</script>

<template>
  <section
    class="bg-navy-deep pb-24 pt-12 text-white sm:pt-16"
    :style="{
      backgroundImage:
        'radial-gradient(900px 420px at 85% -20%, rgb(246 146 30 / 0.16), transparent 60%),' +
        'linear-gradient(165deg, rgb(10 20 48) 0%, rgb(20 36 78) 100%)',
    }"
  >
    <UiContainer>
      <p class="font-display text-xs font-bold uppercase tracking-[0.18em] text-orange">{{ t('contest.eyebrow') }}</p>
      <h1 class="mt-2.5 max-w-[22ch] text-balance font-display text-display-lg font-extrabold">{{ t('contest.title') }}</h1>
      <p class="mt-3 max-w-prose text-white/75">{{ t('contest.lead') }}</p>

      <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm" data-testid="contest-status" :data-status="statut">
        <span class="inline-flex items-center gap-2 font-semibold">
          <span class="h-2 w-2 rounded-full" :class="pastille[statut]" aria-hidden="true" />
          {{ t(`contest.status.${statut}`) }}
        </span>
        <span class="h-1.5 max-w-80 flex-[1_1_220px] overflow-hidden rounded-full bg-white/15" aria-hidden="true">
          <span class="block h-full rounded-full bg-orange" :style="{ width: `${avance}%` }" />
        </span>
        <span class="tabular-nums text-white/70">
          {{ date(debut) }} → {{ date(fin) }}<template v-if="statut === 'en_cours'"> · {{ t('contest.daysLeft', jours) }}</template>
        </span>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <a
          href="#bareme"
          class="inline-flex items-center rounded-el bg-orange px-5 py-3 font-bold text-navy-deep transition hover:bg-orange-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange active:scale-[0.97]"
        >{{ t('contest.seeRules') }}</a>
        <a
          :href="t('contest.guideUrl')"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center rounded-el px-5 py-3 font-bold text-white shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.4)] transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange active:scale-[0.97]"
        >{{ t('contest.guide') }} <span aria-hidden="true">↗</span><span class="sr-only"> {{ t('contest.newTab') }}</span></a>
      </div>
    </UiContainer>
  </section>
</template>
