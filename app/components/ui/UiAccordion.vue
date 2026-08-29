<script setup lang="ts">
import type { AccordionItem } from '@/lib/ui-types'

defineProps<{ items: AccordionItem[] }>()
</script>

<template>
  <div class="divide-y divide-line border-y border-line">
    <details v-for="item in items" :key="item.id" class="group py-5">
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold"
      >
        {{ item.question }}
        <span
          aria-hidden="true"
          class="shrink-0 text-ink-muted transition-transform duration-150 group-open:rotate-45"
        >+</span>
      </summary>
      <p class="mt-3 max-w-prose text-ink-muted">{{ item.answer }}</p>
    </details>
  </div>
</template>
