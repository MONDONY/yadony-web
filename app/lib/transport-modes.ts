// Modes de transport côté site public : trois groupes (Avion, Bateau, Route).
// Route regroupe CAR et BUS. TRAIN, OTHER et toute valeur inconnue n'ont pas de
// groupe : ils s'affichent mais ne se filtrent pas. Logique pure, sans réseau.
export type ModeGroup = 'PLANE' | 'BOAT' | 'ROAD'

export type WireMode = 'PLANE' | 'BOAT' | 'CAR'

const ORDER: ModeGroup[] = ['PLANE', 'BOAT', 'ROAD']

// Liste des modes ouverts au public, fixée à la construction du site
// (NUXT_PUBLIC_TRANSPORT_MODES, ex. « PLANE,ROAD »). Valeurs inconnues
// ignorées ; l'avion est toujours présent ; ordre Avion, Bateau, Route.
export function parsePublicModes(raw: string | undefined): ModeGroup[] {
  const wanted = new Set(
    (raw ?? '')
      .split(',')
      .map(value => value.trim().toUpperCase())
      .filter(value => ORDER.includes(value as ModeGroup)),
  )
  wanted.add('PLANE')
  return ORDER.filter(group => wanted.has(group))
}

export function groupOf(mode: string | undefined): ModeGroup | null {
  switch (mode) {
    case 'PLANE':
      return 'PLANE'
    case 'BOAT':
      return 'BOAT'
    case 'CAR':
    case 'BUS':
      return 'ROAD'
    default:
      return null
  }
}

// Valeur envoyée au back pour un groupe : le filtre CAR inclut BUS.
export function wireModeOf(group: ModeGroup): WireMode {
  return group === 'ROAD' ? 'CAR' : group
}

export type TransportIconName = 'plane' | 'ship' | 'car' | 'route'

// Icône d'un mode : PLANE avion, BOAT bateau, CAR et BUS voiture, le reste
// (TRAIN, OTHER, inconnu, absent) l'icône neutre « trajet ». Jamais l'avion
// par défaut.
export function iconOf(mode: string | undefined): TransportIconName {
  switch (mode) {
    case 'PLANE':
      return 'plane'
    case 'BOAT':
      return 'ship'
    case 'CAR':
    case 'BUS':
      return 'car'
    default:
      return 'route'
  }
}
