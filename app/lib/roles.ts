export type Role = 'expediteur' | 'voyageur'

export const roles: Role[] = ['expediteur', 'voyageur']

export function resolveRole(value: unknown): Role {
  if (typeof value !== 'string') return 'expediteur'
  const normalized = value.toLowerCase()
  return normalized === 'voyageur' ? 'voyageur' : 'expediteur'
}
