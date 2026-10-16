<script setup lang="ts">
// Paiement bloqué jusqu'à la livraison : le cadenas se ferme sur le montant,
// puis s'ouvre quand le destinataire donne son code.
defineProps<{ locked: boolean; amount: string; caption: string }>()
</script>

<template>
  <div class="flex w-full max-w-xs flex-col items-center rounded-sheet bg-surface p-8 shadow-lg">
    <svg
      viewBox="0 0 120 140"
      class="w-28 transition-colors duration-slow"
      :class="locked ? 'text-primary' : 'text-success'"
      :data-locked="locked"
      aria-hidden="true"
    >
      <path
        d="M30 62V44a30 30 0 0 1 60 0v18"
        fill="none"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
        class="transition-transform duration-page ease-dony"
        :style="{ transform: locked ? 'translateY(0)' : 'translateY(-16px) rotate(-12deg)', transformOrigin: '30px 62px' }"
      />
      <rect x="14" y="60" width="92" height="74" rx="16" fill="currentColor" />
      <circle cx="60" cy="92" r="9" fill="white" />
      <rect x="56" y="96" width="8" height="18" rx="4" fill="white" />
    </svg>
    <p class="mt-5 font-display text-3xl font-bold tabular-nums text-ink">{{ amount }}</p>
    <p class="mt-1 text-sm font-semibold" :class="locked ? 'text-primary' : 'text-success'">{{ caption }}</p>
  </div>
</template>
