<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Defi, StatutSujet, SuiviTesteur } from '@/lib/classement/defis'

const props = defineProps<{ defi: Defi }>()
const { t, locale } = useI18n()

const sujets = (): number[] => Array.from({ length: props.defi.sujets ?? 3 }, (_, i) => i + 1)
const symbole: Record<StatutSujet, string> = { ok: '✅', attente: '⏳', non: '✕' }

function total(s: SuiviTesteur): string {
  const ok = s.defis.filter(d => d === 'ok').length
  const attente = s.defis.filter(d => d === 'attente').length
  return attente ? `${ok} (+${attente})` : String(ok)
}
function texte(v: { fr: string; en: string }): string {
  return locale.value === 'en' ? v.en : v.fr
}
</script>

<template>
  <div class="mt-4">
    <div class="overflow-x-auto rounded-el bg-surface" data-testid="defi-suivi-tableau">
      <table class="w-full min-w-[34rem] text-[13.5px] tabular-nums">
        <thead>
          <tr class="text-ink-muted">
            <th scope="col" class="px-3 py-2 text-left font-semibold">{{ t('contest.defis.suiviTester') }}</th>
            <th v-for="n in sujets()" :key="n" scope="col" class="px-1 py-2 text-center font-semibold">{{ n }}</th>
            <th scope="col" class="px-3 py-2 text-right font-semibold">{{ t('contest.defis.suiviTotal') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="s in defi.suivi" :key="s.nom">
            <th scope="row" class="whitespace-nowrap px-3 py-2 text-left font-semibold">{{ s.nom }}</th>
            <td v-for="(statut, i) in s.defis" :key="i" class="px-1 py-2 text-center" :data-statut="statut">
              <span aria-hidden="true">{{ symbole[statut] }}</span>
              <span class="sr-only">{{ t(`contest.defis.suiviStatut.${statut}`) }}</span>
            </td>
            <td class="whitespace-nowrap px-3 py-2 text-right font-display font-extrabold">{{ total(s) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-1.5 text-[12.5px] text-ink-muted">{{ t('contest.defis.suiviLegende') }}</p>

    <div class="mt-3 grid gap-2" data-testid="defi-suivi-detail">
      <template v-for="s in defi.suivi" :key="s.nom">
      <p v-if="!s.manques.length" class="rounded-el bg-surface px-3.5 py-2.5 text-[14px] font-bold text-success">{{ t('contest.defis.suiviFini', { nom: s.nom }) }}</p>
      <details v-else class="rounded-el bg-surface px-3.5 py-2.5">
        <summary class="cursor-pointer text-[14px] font-bold text-accent-text">{{ t('contest.defis.suiviManque', { nom: s.nom }) }}</summary>
        <ul class="mt-2 grid gap-2.5 text-[14px] leading-relaxed">
          <li v-for="m in s.manques" :key="m.defi">
            <p class="font-display font-extrabold">{{ t('contest.defis.suiviDefi', { n: m.defi }) }}</p>
            <p class="text-pretty text-ink-muted">{{ t('contest.defis.suiviFait') }} : {{ texte(m.fait) }}</p>
            <p class="text-pretty">{{ t('contest.defis.suiviAFaire') }} : {{ texte(m.aFaire) }}</p>
          </li>
        </ul>
      </details>
      </template>
    </div>
  </div>
</template>
