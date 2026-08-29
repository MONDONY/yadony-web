<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof IntersectionObserver === 'undefined') {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.value = true
          observer?.disconnect()
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
    :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
  >
    <slot />
  </div>
</template>
