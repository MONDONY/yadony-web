import { describe, expect, it } from 'vitest'
import { groupOf, iconOf, parsePublicModes, wireModeOf } from '@/lib/transport-modes'

describe('transport-modes', () => {
  it('parsePublicModes : avion toujours présent, inconnus ignorés, ordre fixe', () => {
    expect(parsePublicModes(undefined)).toEqual(['PLANE'])
    expect(parsePublicModes('')).toEqual(['PLANE'])
    expect(parsePublicModes('ROAD, plane,ROCKET')).toEqual(['PLANE', 'ROAD'])
    expect(parsePublicModes('ROAD,BOAT')).toEqual(['PLANE', 'BOAT', 'ROAD'])
  })

  it('groupOf : BUS est Route, TRAIN et inconnu sans groupe', () => {
    expect(groupOf('PLANE')).toBe('PLANE')
    expect(groupOf('BOAT')).toBe('BOAT')
    expect(groupOf('CAR')).toBe('ROAD')
    expect(groupOf('BUS')).toBe('ROAD')
    expect(groupOf('TRAIN')).toBeNull()
    expect(groupOf('OTHER')).toBeNull()
    expect(groupOf(undefined)).toBeNull()
  })

  it('wireModeOf : Route part en CAR', () => {
    expect(wireModeOf('PLANE')).toBe('PLANE')
    expect(wireModeOf('BOAT')).toBe('BOAT')
    expect(wireModeOf('ROAD')).toBe('CAR')
  })

  it('iconOf : repli neutre, jamais l’avion', () => {
    expect(iconOf('PLANE')).toBe('plane')
    expect(iconOf('BOAT')).toBe('ship')
    expect(iconOf('CAR')).toBe('car')
    expect(iconOf('BUS')).toBe('car')
    expect(iconOf('TRAIN')).toBe('route')
    expect(iconOf('OTHER')).toBe('route')
    expect(iconOf('XYZ')).toBe('route')
    expect(iconOf(undefined)).toBe('route')
  })
})
