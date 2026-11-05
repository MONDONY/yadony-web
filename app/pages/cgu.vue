<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { legalToc, renderLegalArticles } from '@/lib/legal'

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

const toc = computed(() => legalToc(articles.value.map(article => article.title)))
</script>

<template>
  <LegalLayout :title="t('legal.cgu.title')" :toc="toc">
    <p class="max-w-prose text-lg text-ink-muted">{{ t('legal.cgu.intro') }}</p>

    <ProseBlock class="mt-12">
      <template v-for="(article, articleIndex) in articles" :key="article.title">
        <h2 :id="toc[articleIndex]?.id">{{ article.title }}</h2>
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
  </LegalLayout>
</template>
