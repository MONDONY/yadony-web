import { computed, type ComputedRef } from 'vue'
import { parsePublicModes, type ModeGroup } from '@/lib/transport-modes'

// Groupes de modes ouverts au public, lus dans la configuration du site
// (NUXT_PUBLIC_TRANSPORT_MODES, défaut PLANE). `useRuntimeConfig` est une
// auto-import de Nuxt.
export function usePublicModes(): ComputedRef<ModeGroup[]> {
  const config = useRuntimeConfig()
  return computed(() => parsePublicModes(config.public.transportModes as string | undefined))
}
