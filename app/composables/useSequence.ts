import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

// Déroule les états d'une illustration (bulles de négociation, jalons de
// suivi…) quand sa scène devient active, puis s'arrête sur le dernier.
// Revient au premier état quand la scène n'est plus active. En mouvement
// réduit, l'état final s'affiche directement.
export function useSequence(active: Ref<boolean>, length: number, interval = 900) {
  const index = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined
  let reduced = false

  function stop() {
    if (timer) clearInterval(timer)
    timer = undefined
  }

  function run(on: boolean) {
    stop()
    if (!on) {
      index.value = 0
      return
    }
    if (reduced) {
      index.value = length - 1
      return
    }
    index.value = 0
    timer = setInterval(() => {
      if (index.value < length - 1) index.value += 1
      else stop()
    }, interval)
  }

  onMounted(() => {
    reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    run(active.value)
    watch(active, run)
  })

  onBeforeUnmount(stop)

  return { index }
}
