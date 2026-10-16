import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// Étape active d'une scène racontée au défilement : celle dont le corps
// traverse la bande centrale de l'écran (10 % de hauteur). La première étape
// est active par défaut, ce qui donne au HTML prérendu le même état initial
// que la page animée.
export function useScrollSteps(steps: Ref<Element[]>) {
  const active = ref(0)
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = steps.value.indexOf(entry.target)
          if (index >= 0) active.value = index
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    for (const step of steps.value) observer.observe(step)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { active }
}
