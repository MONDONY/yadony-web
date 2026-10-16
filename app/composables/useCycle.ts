import { onBeforeUnmount, onMounted, ref } from 'vue'

// Rotation en boucle entre plusieurs états (écrans du téléphone du haut de
// page). Figée en mouvement réduit ; `pause`/`resume` pour le survol et le
// focus, `select` pour un choix explicite du visiteur.
export function useCycle(length: number, interval = 3200) {
  const index = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined
  let reduced = false

  function pause() {
    if (timer) clearInterval(timer)
    timer = undefined
  }

  function resume() {
    pause()
    if (reduced) return
    timer = setInterval(() => {
      index.value = (index.value + 1) % length
    }, interval)
  }

  function select(next: number) {
    index.value = ((next % length) + length) % length
  }

  onMounted(() => {
    reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    resume()
  })

  onBeforeUnmount(pause)

  return { index, pause, resume, select }
}
