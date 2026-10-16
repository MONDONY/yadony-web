<script setup lang="ts">
import { ref } from 'vue'
import { useInView } from '@/composables/useInView'

// Moyens de paiement acceptés dans l'app, en défilement continu. La liste
// est doublée pour boucler sans saut ; la copie est cachée aux lecteurs
// d'écran. Le défilement s'arrête hors de l'écran.
defineProps<{ items: string[] }>()

const root = ref<HTMLElement | null>(null)
const { inView } = useInView(root)
</script>

<template>
  <div ref="root" class="overflow-hidden" :class="{ 'is-paused': !inView }">
    <div class="animate-marquee flex w-max gap-3 motion-reduce:flex-wrap motion-reduce:[animation:none]">
      <ul class="flex list-none gap-3">
        <li v-for="item in items" :key="item" class="whitespace-nowrap rounded-pill border border-line bg-surface px-5 py-3 font-display font-semibold text-ink shadow-xs">{{ item }}</li>
      </ul>
      <ul class="flex list-none gap-3 motion-reduce:hidden" aria-hidden="true">
        <li v-for="item in items" :key="item" class="whitespace-nowrap rounded-pill border border-line bg-surface px-5 py-3 font-display font-semibold text-ink shadow-xs">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>
