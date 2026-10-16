<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { NuxtError } from '#app'
import { donyPose } from '@/lib/media'

defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: t('error.seo.title'),
  description: t('error.seo.description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <NuxtLayout>
    <section class="bg-sand py-14 sm:py-20">
      <UiContainer>
        <div class="grid items-center gap-10 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <h1 class="text-display-xl text-balance">{{ t('error.title') }}</h1>
            <p class="mt-6 max-w-prose text-lg text-ink-muted text-pretty">{{ t('error.lead') }}</p>
            <UiButton :to="localePath('/')" size="lg" class="mt-9">{{ t('error.cta') }}</UiButton>
          </div>
          <UiPicture
            :image="donyPose('no-result')"
            :alt="t('error.donyAlt')"
            sizes="260px"
            eager
            class="animate-float mx-auto w-48 sm:w-60 lg:col-span-5 [&_img]:h-auto [&_img]:w-full"
          />
        </div>
      </UiContainer>
    </section>
  </NuxtLayout>
</template>
