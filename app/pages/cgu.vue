<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { renderLegalArticles } from '@/lib/legal'

defineI18nRoute({ paths: { fr: '/cgu', en: '/terms' } })

const { t, tm, rt, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('legal.cgu.seo.title'),
    description: t('legal.cgu.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const articles = computed(() =>
  renderLegalArticles(tm('legal.cgu.articles') as unknown[], (message) => rt(message as never)),
)
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[24ch] text-display-xl">{{ t('legal.cgu.title') }}</h1>
      <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('legal.cgu.intro') }}</p>

      <ProseBlock class="mt-12">
        <template v-for="article in articles" :key="article.title">
          <h2>{{ article.title }}</h2>
          <template v-for="(block, index) in article.blocks" :key="index">
            <h3 v-if="block.sub">{{ block.sub }}</h3>
            <p v-for="paragraph in block.p" :key="paragraph">{{ paragraph }}</p>
            <ul v-if="block.ul.length">
              <li v-for="item in block.ul" :key="item">{{ item }}</li>
            </ul>
          </template>
        </template>
      </ProseBlock>

      <p class="mt-12 max-w-prose font-semibold">{{ t('legal.cgu.closing') }}</p>
    </UiContainer>
  </UiSection>
</template>
