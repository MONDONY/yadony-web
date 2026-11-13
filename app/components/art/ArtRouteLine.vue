<script setup lang="ts">
// Trajet qui se dessine entre deux villes, avec un colis qui suit la courbe
// (offset-path), sans mode de transport dessiné : l'illustration vaut pour
// tous les trajets. `drawn` déclenche le tracé ; sans animation, le trajet
// apparaît directement dessiné.
defineProps<{ from: string; to: string; drawn: boolean }>()

const path = 'M40 150 C 130 30, 270 30, 360 120'
</script>

<template>
  <svg viewBox="0 0 400 190" class="w-full overflow-visible" aria-hidden="true">
    <path :d="path" fill="none" stroke="rgb(var(--line))" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" />
    <path
      :d="path"
      fill="none"
      stroke="rgb(var(--accent))"
      stroke-width="3.5"
      stroke-linecap="round"
      pathLength="1"
      stroke-dasharray="1"
      class="transition-[stroke-dashoffset] duration-[1400ms] ease-dony motion-reduce:transition-none"
      :style="{ strokeDashoffset: drawn ? 0 : 1 }"
    />
    <g
      class="transition-[offset-distance] duration-[1400ms] ease-dony motion-reduce:transition-none"
      :style="{ offsetPath: `path('${path}')`, offsetDistance: drawn ? '100%' : '0%', offsetRotate: '0deg' }"
    >
      <g data-glyph="parcel">
        <rect x="-10" y="-8.5" width="20" height="17" rx="4" fill="rgb(var(--primary))" />
        <rect x="-2" y="-8.5" width="4" height="17" fill="rgb(var(--accent))" />
      </g>
    </g>
    <circle cx="40" cy="150" r="7" fill="rgb(var(--primary))" />
    <circle cx="360" cy="120" r="7" fill="rgb(var(--accent))" />
    <text x="40" y="180" text-anchor="middle" class="fill-ink font-display text-[15px] font-bold">{{ from }}</text>
    <text x="360" y="150" text-anchor="middle" class="fill-ink font-display text-[15px] font-bold" dy="30">{{ to }}</text>
  </svg>
</template>
