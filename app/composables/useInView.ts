import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export interface InViewOptions {
  /** Cesse d'observer après la première entrée à l'écran. */
  once?: boolean
  rootMargin?: string
  threshold?: number
}

// Visibilité d'un élément, en amélioration progressive : sans
// IntersectionObserver, ou quand le visiteur demande moins d'animations,
// l'élément est considéré visible d'office et rien n'est animé.
export function useInView(target: Ref<Element | null>, options: InViewOptions = {}) {
  const inView = ref(false)
  const reducedMotion = ref(false)
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    reducedMotion.value = typeof matchMedia === 'function'
      && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion.value || typeof IntersectionObserver === 'undefined' || !target.value) {
      inView.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView.value = entry.isIntersecting || (options.once === true && inView.value)
          if (entry.isIntersecting && options.once) observer?.disconnect()
        }
      },
      { rootMargin: options.rootMargin ?? '0px 0px -10% 0px', threshold: options.threshold ?? 0.15 },
    )
    observer.observe(target.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { inView, reducedMotion }
}
