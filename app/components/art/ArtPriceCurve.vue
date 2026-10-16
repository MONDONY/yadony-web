<script setup lang="ts">
// Alerte de prix : la courbe du prix d'un vol descend sous le seuil choisi,
// une notification apparaît. Les libellés viennent de la page (i18n).
defineProps<{ drawn: boolean; threshold: string; notification: string; detail: string }>()

const curve = 'M10 40 C 60 30, 90 70, 130 60 S 200 30, 240 80 S 300 150, 350 140'
</script>

<template>
  <div class="relative w-full max-w-md rounded-sheet bg-surface p-6 shadow-lg">
    <svg viewBox="0 0 360 180" class="w-full" aria-hidden="true">
      <line x1="0" y1="110" x2="360" y2="110" stroke="rgb(var(--success))" stroke-width="2" stroke-dasharray="6 6" />
      <text x="356" y="102" text-anchor="end" class="fill-success text-[12px] font-bold">{{ threshold }}</text>
      <path
        :d="curve"
        fill="none"
        stroke="rgb(var(--primary))"
        stroke-width="3.5"
        stroke-linecap="round"
        pathLength="1"
        stroke-dasharray="1"
        class="transition-[stroke-dashoffset] duration-[1600ms] ease-dony motion-reduce:transition-none"
        :style="{ strokeDashoffset: drawn ? 0 : 1 }"
      />
      <circle cx="350" cy="140" r="7" fill="rgb(var(--success))" class="transition-opacity delay-[1400ms] duration-base" :class="drawn ? 'opacity-100' : 'opacity-0'" />
    </svg>
    <div
      class="absolute -bottom-6 left-6 right-6 flex items-center gap-3 rounded-card bg-ink px-4 py-3 text-white shadow-xl transition-[opacity,translate] delay-[1500ms] duration-slow ease-dony motion-reduce:delay-0"
      :class="drawn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
    >
      <span class="grid size-9 shrink-0 place-items-center rounded-btn bg-success">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
      <span class="min-w-0">
        <span class="block text-sm font-bold">{{ notification }}</span>
        <span class="block truncate text-xs text-white/75">{{ detail }}</span>
      </span>
    </div>
  </div>
</template>
