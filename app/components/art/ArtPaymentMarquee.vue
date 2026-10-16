<script setup lang="ts">
import { computed, ref } from 'vue'
import { useInView } from '@/composables/useInView'

// Moyens de paiement acceptés dans l'app, en défilement continu. La liste
// est doublée pour boucler sans saut ; la copie est cachée aux lecteurs
// d'écran. Le défilement s'arrête hors de l'écran, et le visiteur peut le
// mettre en pause (WCAG 2.2.2). En mouvement réduit, les pastilles sont
// simplement posées les unes à côté des autres, sur plusieurs lignes.
defineProps<{ items: string[]; pauseLabel: string; playLabel: string }>()

const root = ref<HTMLElement | null>(null)
const { inView } = useInView(root)
const pausedByUser = ref(false)
const paused = computed(() => pausedByUser.value || !inView.value)
</script>

<template>
  <div class="relative">
    <div ref="root" data-marquee class="overflow-hidden" :class="{ 'is-paused': paused }">
      <div class="animate-marquee flex w-max gap-3 motion-reduce:w-auto motion-reduce:px-5 motion-reduce:[animation:none]">
        <ul class="flex list-none gap-3 motion-reduce:flex-wrap">
          <li v-for="item in items" :key="item" class="whitespace-nowrap rounded-pill border border-line bg-surface px-5 py-3 font-display font-semibold text-ink shadow-xs">{{ item }}</li>
        </ul>
        <ul class="flex list-none gap-3 motion-reduce:hidden" aria-hidden="true">
          <li v-for="item in items" :key="item" class="whitespace-nowrap rounded-pill border border-line bg-surface px-5 py-3 font-display font-semibold text-ink shadow-xs">{{ item }}</li>
        </ul>
      </div>
    </div>
    <button
      type="button"
      class="mx-auto mt-4 grid size-11 place-items-center rounded-full border border-line bg-surface text-ink transition-colors duration-micro ease-dony hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hidden"
      :aria-label="pausedByUser ? playLabel : pauseLabel"
      @click="pausedByUser = !pausedByUser"
    >
      <svg v-if="pausedByUser" aria-hidden="true" viewBox="0 0 24 24" class="size-4 translate-x-px" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
      <svg v-else aria-hidden="true" viewBox="0 0 24 24" class="size-4" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
    </button>
  </div>
</template>
