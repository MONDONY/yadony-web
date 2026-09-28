<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { betaWhatsAppGroupUrl } from '@/lib/site'
import { whatsappIconPath } from '@/lib/social'

const { t } = useI18n()
</script>

<template>
  <!-- Rendu à l'intérieur du <header> sticky : les deux rangées se collent
       ainsi en un seul bloc, sans avoir à recalculer un décalage `top` quand
       le texte du bandeau passe sur deux lignes en mobile. -->
  <div
    class="bg-navy-deep text-white shadow-[inset_0_-1px_0_rgb(255_255_255/0.12)]"
    role="region"
    :aria-label="t('beta.banner.label')"
  >
    <UiContainer>
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center">
        <span
          class="inline-flex shrink-0 items-center rounded-full bg-orange px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-navy-deep"
        >{{ t('beta.banner.badge') }}</span>

        <p class="hidden text-[13px] text-white/80 sm:block sm:text-sm">{{ t('beta.banner.text') }}</p>

        <a
          :href="betaWhatsAppGroupUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-el text-[13px] font-semibold text-orange underline decoration-orange/40 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 hover:text-orange-hover hover:decoration-orange-hover active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-sm"
        >
          <svg class="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path :d="whatsappIconPath" />
          </svg>
          {{ t('beta.banner.cta') }}
          <span class="sr-only">{{ ` ${t('a11y.opensNewTab')}` }}</span>
        </a>
      </div>
    </UiContainer>
  </div>
</template>
