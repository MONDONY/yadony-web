<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const rows = ['whatsapp', 'carrier', 'yadony'] as const
</script>

<template>
  <UiSection tone="sand">
    <UiContainer>
      <h2 id="home-problem-title" class="max-w-[20ch] text-display-lg">{{ t('home.problem.title') }}</h2>

      <div class="mt-10 overflow-x-auto">
        <table
          class="w-full min-w-[560px] border-collapse text-left text-sm"
          aria-labelledby="home-problem-title"
        >
          <thead>
            <tr class="border-b border-line text-ink-muted">
              <th scope="col" class="py-3 pr-6 font-medium">{{ t('home.problem.columns.channel') }}</th>
              <th scope="col" class="py-3 pr-6 font-medium">{{ t('home.problem.columns.price') }}</th>
              <th scope="col" class="py-3 pr-6 font-medium">{{ t('home.problem.columns.tracking') }}</th>
              <th scope="col" class="py-3 font-medium">{{ t('home.problem.columns.recourse') }}</th>
            </tr>
          </thead>
          <tbody class="tabular-nums">
            <tr
              v-for="row in rows"
              :key="row"
              class="border-b border-line"
              :class="row === 'yadony' ? 'font-semibold text-ink' : 'text-ink-muted'"
            >
              <th scope="row" class="py-4 pr-6 font-normal">{{ t(`home.problem.rows.${row}.channel`) }}</th>
              <td class="py-4 pr-6">{{ t(`home.problem.rows.${row}.price`) }}</td>
              <td class="py-4 pr-6">{{ t(`home.problem.rows.${row}.tracking`) }}</td>
              <td class="py-4">{{ t(`home.problem.rows.${row}.recourse`) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiContainer>
  </UiSection>
</template>
