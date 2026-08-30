<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/lib/locale'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const open = ref(false)

const targetLocale = computed<Locale>(() => (locale.value === 'fr' ? 'en' : 'fr'))
const switchHref = computed(() => switchLocalePath(targetLocale.value))
const switchLabel = computed(() =>
  t('language.switchTo', { language: t(`language.${targetLocale.value}`) }),
)

const links = computed(() => [
  { to: '/comment-ca-marche', label: t('nav.howItWorks') },
  { to: '/tarifs', label: t('nav.pricing') },
  { to: '/securite', label: t('nav.trust') },
  { to: '/a-propos', label: t('nav.about') },
])
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
    <UiContainer>
      <div class="flex h-16 items-center justify-between gap-6">
        <NuxtLink :to="localePath('/')" class="shrink-0">
          <img
            src="/logos/logo-yadony-480.webp"
            alt="Yadony"
            width="480"
            height="131"
            class="h-8 w-auto"
            loading="eager"
          >
        </NuxtLink>

        <nav class="hidden items-center gap-7 md:flex" :aria-label="t('nav.mainLabel')">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="localePath(link.to)"
            class="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
          >{{ link.label }}</NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <LanguageSwitcher :href="switchHref" :target-locale="targetLocale" :label="switchLabel" />
          <UiButton :to="`${localePath('/')}#telecharger`" variant="orange" class="hidden sm:inline-flex">
            {{ t('nav.download') }}
          </UiButton>
          <button
            type="button"
            class="md:hidden rounded-el border border-line px-3 py-1.5 text-sm"
            :aria-expanded="open"
            aria-controls="menu-mobile"
            @click="open = !open"
          >{{ t('nav.menu') }}</button>
        </div>
      </div>

      <nav v-show="open" id="menu-mobile" class="border-t border-line py-4 md:hidden" :aria-label="t('nav.mobileLabel')">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="localePath(link.to)"
          class="block py-2.5 text-ink-muted"
          @click="open = false"
        >{{ link.label }}</NuxtLink>
      </nav>
    </UiContainer>
  </header>
</template>
