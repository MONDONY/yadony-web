<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AccordionItem } from '@/lib/ui-types'

const { t, tm, rt } = useI18n()

const items = computed<AccordionItem[]>(() =>
  (tm('home.faq.items') as unknown[]).map((raw, index) => {
    const entry = raw as { id: unknown; question: unknown; answer: unknown }
    return {
      id: String(rt(entry.id as never)) || `faq-${index}`,
      question: rt(entry.question as never),
      answer: rt(entry.answer as never),
    }
  }),
)

defineExpose({ items })
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h2 class="max-w-[18ch] text-display-lg">{{ t('home.faq.title') }}</h2>
      <div class="mt-10 max-w-3xl">
        <UiAccordion :items="items" />
      </div>
    </UiContainer>
  </UiSection>
</template>
