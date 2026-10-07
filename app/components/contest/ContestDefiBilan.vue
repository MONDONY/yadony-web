<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Defi } from '@/lib/classement/defis'
import { localeDates } from '@/lib/classement/score'

const props = defineProps<{ defi: Defi }>()
const { t, locale } = useI18n()

function heure(iso: string): string {
  const h = new Intl.DateTimeFormat(localeDates(locale.value), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Paris' }).format(new Date(iso))
  return locale.value === 'en' ? h : h.replace(':', ' h ')
}
/** Partiels regroupés par nombre de parties réussies, du plus grand au plus petit. */
function groupesPartiels(): { parties: number; noms: string[] }[] {
  const groupes = new Map<number, string[]>()
  for (const p of props.defi.partiels ?? []) {
    if (p.parties > 0) groupes.set(p.parties, [...(groupes.get(p.parties) ?? []), p.nom])
  }
  return [...groupes].sort((a, b) => b[0] - a[0]).map(([parties, noms]) => ({ parties, noms }))
}
</script>

<template>
  <div v-if="defi.reussites?.length" class="mt-4" data-testid="defi-reussites">
    <p class="font-display text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">{{ t('contest.defis.reussitesTitle', { n: defi.reussites.length }) }}</p>
    <ol class="mt-2 divide-y divide-line rounded-el bg-surface">
      <li v-for="(r, i) in defi.reussites" :key="r.nom" class="flex items-center gap-3 px-3.5 py-2.5 text-[14.5px]">
        <span class="grid h-7 w-7 flex-none place-items-center rounded-full font-display text-[13px] font-extrabold tabular-nums" :class="i === 0 ? 'bg-orange text-navy-deep' : 'bg-sand text-ink'">{{ i + 1 }}</span>
        <span class="min-w-0 flex-1 truncate font-semibold">{{ r.nom }}</span>
        <span class="flex-none tabular-nums text-ink-muted">{{ heure(r.fin) }}</span>
      </li>
    </ol>
  </div>
  <ul v-if="groupesPartiels().length" class="mt-2 grid gap-1.5 text-[14px]" data-testid="defi-partiels">
    <li v-for="g in groupesPartiels()" :key="g.parties" class="text-pretty">
      <b class="font-semibold">{{ t('contest.defis.partiels', { n: g.parties, total: props.defi.sujets ?? 3 }, g.parties) }}</b>
      <span class="text-ink-muted"> · {{ g.noms.join(', ') }}</span>
    </li>
  </ul>
  <div v-if="defi.bilan?.length" class="mt-4" data-testid="defi-bilan">
    <p class="font-display text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">{{ t('contest.defis.bilanTitle') }}</p>
    <ul class="mt-2 grid gap-2">
      <li v-for="(partie, i) in defi.bilan" :key="i" class="rounded-el bg-surface px-3.5 py-3">
        <p class="font-display text-[14.5px] font-extrabold">{{ locale === 'en' ? partie.titre.en : partie.titre.fr }}</p>
        <p class="mt-0.5 text-pretty text-[14px] leading-relaxed text-ink-muted">{{ locale === 'en' ? partie.texte.en : partie.texte.fr }}</p>
      </li>
    </ul>
  </div>
</template>
