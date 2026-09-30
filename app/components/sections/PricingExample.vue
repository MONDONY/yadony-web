<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computeQuote } from '@/lib/pricing'

const { t, n } = useI18n()
const quote = computeQuote({ weightKg: 5, pricePerKg: 8 })
</script>

<template>
  <div class="rounded-card border border-line">
    <table class="w-full border-collapse text-left text-sm tabular-nums">
      <caption class="border-b border-line px-6 py-5 text-left font-display text-lg font-semibold">
        {{ t('pricing.example.caption') }}
      </caption>
      <tbody>
        <tr class="border-b border-line">
          <th scope="row" class="px-6 py-4 font-normal text-ink-muted">{{ t('pricing.example.travelerPrice') }}</th>
          <td class="px-6 py-4 text-right">{{ n(quote.travelerPrice, 'currency') }}</td>
        </tr>
        <tr class="border-b border-line">
          <th scope="row" class="px-6 py-4 font-normal text-ink-muted">{{ t('pricing.example.commission') }}</th>
          <td class="px-6 py-4 text-right text-ink-muted">{{ t('pricing.example.commissionValue') }}</td>
        </tr>
        <tr class="border-b border-line font-semibold">
          <th scope="row" class="px-6 py-4">{{ t('pricing.example.senderPays') }}</th>
          <td class="px-6 py-4 text-right text-orange-deep">{{ t('pricing.example.senderPaysValue') }}</td>
        </tr>
        <tr>
          <th scope="row" class="px-6 py-4 font-normal text-ink-muted">{{ t('pricing.example.travelerEarns') }}</th>
          <td class="px-6 py-4 text-right">
            {{ n(quote.travelerEarns, 'currency') }}
            <span class="block text-xs font-normal text-ink-muted">{{ t('pricing.example.travelerEarnsValue') }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
