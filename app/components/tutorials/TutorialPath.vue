<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Chemin d'un tutoriel dans l'app. Le glyphe ☰ (le bouton Menu de l'app) reste
// visible tel quel, mais les lecteurs d'écran le lisent « trigramme du ciel » :
// on le masque et on lit « Menu » à la place.
const props = defineProps<{ id: string }>()
const { t } = useI18n()
const parts = computed(() => t(`tutorials.items.${props.id}.path`).split('☰'))
</script>

<template>
  <span><template v-for="(part, index) in parts" :key="index"><template v-if="index > 0"><span aria-hidden="true">☰</span><span class="sr-only">{{ t('tutorials.menuLabel') }}</span></template>{{ part }}</template></span>
</template>
