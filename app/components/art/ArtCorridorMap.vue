<script setup lang="ts">
// Carte stylisée France → Afrique : villes de départ et d'arrivée placées
// d'après leurs coordonnées (projection équirectangulaire simple), routes
// tracées à l'entrée de la section. Décorative : la liste des corridors,
// avec ses liens, est dans le HTML de la section.
defineProps<{ drawn: boolean }>()

type City = { name: string; lon: number; lat: number }
const departures: City[] = [
  { name: 'Paris', lon: 2.35, lat: 48.85 },
  { name: 'Lyon', lon: 4.85, lat: 45.76 },
  { name: 'Marseille', lon: 5.37, lat: 43.3 },
]
const arrivals: City[] = [
  { name: 'Dakar', lon: -17.45, lat: 14.7 },
  { name: 'Bamako', lon: -8, lat: 12.64 },
  { name: 'Abidjan', lon: -4.02, lat: 5.35 },
  { name: 'Douala', lon: 9.7, lat: 4.05 },
]

const x = (lon: number) => (lon + 22) * 11
const y = (lat: number) => (52 - lat) * 11

function route(a: City, b: City) {
  const mx = (x(a.lon) + x(b.lon)) / 2 - 40
  const my = (y(a.lat) + y(b.lat)) / 2
  return `M${x(a.lon)} ${y(a.lat)} Q ${mx} ${my} ${x(b.lon)} ${y(b.lat)}`
}

const routes = departures.flatMap((from, i) => arrivals.map((to, j) => ({ d: route(from, to), delay: (i * 4 + j) * 90 })))
</script>

<template>
  <svg viewBox="0 0 380 540" class="w-full" aria-hidden="true">
    <defs>
      <pattern id="dots" width="11" height="11" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.2" fill="rgb(var(--ink) / 0.12)" />
      </pattern>
    </defs>
    <rect width="380" height="540" fill="url(#dots)" rx="24" />
    <path
      v-for="(item, index) in routes"
      :key="index"
      :d="item.d"
      fill="none"
      stroke="rgb(var(--accent))"
      stroke-width="1.6"
      stroke-linecap="round"
      pathLength="1"
      stroke-dasharray="1"
      opacity="0.75"
      class="transition-[stroke-dashoffset] duration-[1200ms] ease-dony motion-reduce:transition-none"
      :style="{ strokeDashoffset: drawn ? 0 : 1, transitionDelay: `${item.delay}ms` }"
    />
    <g v-for="city in departures" :key="city.name">
      <circle :cx="x(city.lon)" :cy="y(city.lat)" r="5.5" fill="rgb(var(--primary))" />
      <text :x="x(city.lon) + 10" :y="y(city.lat) + 5" class="fill-ink font-display text-[13px] font-bold">{{ city.name }}</text>
    </g>
    <g v-for="city in arrivals" :key="city.name">
      <circle :cx="x(city.lon)" :cy="y(city.lat)" r="10" fill="rgb(var(--accent) / 0.25)" class="animate-ping-soft origin-center [transform-box:fill-box]" />
      <circle :cx="x(city.lon)" :cy="y(city.lat)" r="5.5" fill="rgb(var(--accent))" />
      <text :x="x(city.lon) + 10" :y="y(city.lat) + 5" class="fill-ink font-display text-[13px] font-bold">{{ city.name }}</text>
    </g>
  </svg>
</template>
