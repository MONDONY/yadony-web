<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Révélation au scroll en amélioration progressive : le HTML servi est
// toujours visible (pas de JS = pas de masquage). La classe d'état initial
// n'est posée qu'au montage, juste avant l'observation, donc les moteurs
// et les navigateurs sans JS voient le contenu tel quel.
const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const el = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const node = el.value
  if (!node || typeof IntersectionObserver === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  node.classList.add('reveal-init')
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add('reveal-in')
          observer?.disconnect()
          observer = null
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )
  observer.observe(node)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div ref="el" class="reveal" :style="{ '--reveal-delay': `${props.delay}ms` }">
    <slot />
  </div>
</template>
