<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EARNINGS_BOUNDS, computeGrossEarnings } from '@/lib/earnings'

// Simulateur de gain de la page voyageur. Les valeurs de départ donnent le
// total dès le rendu serveur (15 kg x 8 € = 120 €) ; il devient réactif à
// l'hydratation. Aucun appel réseau.
const { t, locale } = useI18n()
const base = 'journeys.traveler.simulator'

const kg = ref<number>(EARNINGS_BOUNDS.kg.default)
const pricePerKg = ref<number>(EARNINGS_BOUNDS.pricePerKg.default)

const euros = computed(() => {
  const formatter = new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  return (amount: number) => formatter.format(amount)
})
const total = computed(() => euros.value(computeGrossEarnings(kg.value, pricePerKg.value)))
const kgText = computed(() => new Intl.NumberFormat(locale.value, { style: 'unit', unit: 'kilogram' }).format(kg.value))
const priceText = computed(() => euros.value(pricePerKg.value))
</script>

<template>
  <div>
    <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent-text">{{ t(`${base}.kicker`) }}</p>
    <h2 class="mt-3 text-display-md text-ink">{{ t(`${base}.title`) }}</h2>
    <p class="mt-4 text-lg text-ink-muted">{{ t(`${base}.text`) }}</p>

    <div class="mt-8 space-y-5">
      <div>
        <div class="flex items-baseline justify-between gap-4">
          <label for="earnings-kg" class="font-semibold text-ink">{{ t(`${base}.kgLabel`) }}</label>
          <span class="font-display text-lg font-bold tabular-nums text-ink" aria-hidden="true">{{ kgText }}</span>
        </div>
        <input
          id="earnings-kg"
          v-model.number="kg"
          type="range"
          class="earnings-range"
          :min="EARNINGS_BOUNDS.kg.min"
          :max="EARNINGS_BOUNDS.kg.max"
          step="1"
          :aria-valuetext="kgText"
        >
      </div>
      <div>
        <div class="flex items-baseline justify-between gap-4">
          <label for="earnings-price" class="font-semibold text-ink">{{ t(`${base}.priceLabel`) }}</label>
          <span class="font-display text-lg font-bold tabular-nums text-ink" aria-hidden="true">{{ priceText }}</span>
        </div>
        <input
          id="earnings-price"
          v-model.number="pricePerKg"
          type="range"
          class="earnings-range"
          :min="EARNINGS_BOUNDS.pricePerKg.min"
          :max="EARNINGS_BOUNDS.pricePerKg.max"
          step="1"
          :aria-valuetext="priceText"
        >
      </div>
    </div>

    <div class="mt-6 rounded-card bg-sand p-5">
      <p id="earnings-total-label" class="text-sm font-semibold text-ink-muted">{{ t(`${base}.totalLabel`) }}</p>
      <output for="earnings-kg earnings-price" aria-labelledby="earnings-total-label" aria-live="polite" class="mt-1 block font-display text-display-md font-bold tabular-nums text-ink">{{ total }}</output>
    </div>

    <p class="mt-6 text-sm text-ink-muted">{{ t(`${base}.note`) }}</p>
  </div>
</template>

<style scoped>
/* Zone de saisie de 44 px de haut (cible tactile), piste et poignée pleines
   (aucun dégradé). La poignée fait 28 px bordure comprise dans les deux
   moteurs, centrée dans cette zone. */
.earnings-range {
  appearance: none;
  -webkit-appearance: none;
  display: block;
  width: 100%;
  height: 44px;
  margin: 0;
  background: transparent;
  cursor: pointer;
  touch-action: pan-y;
}
.earnings-range::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 4px;
  background: rgb(var(--line));
}
.earnings-range::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: rgb(var(--line));
}
.earnings-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin-top: -10px;
  border: 3px solid rgb(var(--surface));
  border-radius: 50%;
  background: rgb(var(--primary));
  box-shadow: 0 1px 4px rgb(10 37 64 / 0.3);
  transition: scale 150ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.earnings-range::-moz-range-thumb {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border: 3px solid rgb(var(--surface));
  border-radius: 50%;
  background: rgb(var(--primary));
  box-shadow: 0 1px 4px rgb(10 37 64 / 0.3);
  transition: scale 150ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.earnings-range:active::-webkit-slider-thumb { scale: 1.08; }
.earnings-range:active::-moz-range-thumb { scale: 1.08; }
@media (prefers-reduced-motion: reduce) {
  .earnings-range::-webkit-slider-thumb,
  .earnings-range::-moz-range-thumb { transition: none; }
  .earnings-range:active::-webkit-slider-thumb,
  .earnings-range:active::-moz-range-thumb { scale: none; }
}
</style>
