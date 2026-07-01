import { describe, it, expect } from 'vitest'
import { distanceKm, formatDistance } from './distance'

describe('distanceKm', () => {
  it('동일한 좌표는 거리 0', () => {
    const p = { lat: 37.5, lng: 127.0 }
    expect(distanceKm(p, p)).toBe(0)
  })

  it('알려진 짧은 거리를 오차 범위 내로 계산한다 (서울시청→광화문 ~1km)', () => {
    const cityHall = { lat: 37.5663, lng: 126.9779 }
    const gwanghwamun = { lat: 37.5759, lng: 126.9769 }
    const d = distanceKm(cityHall, gwanghwamun)
    expect(d).toBeGreaterThan(0.8)
    expect(d).toBeLessThan(1.3)
  })

  it('대칭성: dist(a,b) === dist(b,a)', () => {
    const a = { lat: 35.1, lng: 129.0 }
    const b = { lat: 37.5, lng: 127.0 }
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 6)
  })
})

describe('formatDistance', () => {
  it('1km 미만은 미터로 표기', () => {
    expect(formatDistance(0.42)).toBe('420m')
  })
  it('1km 이상은 소수 첫째자리 km', () => {
    expect(formatDistance(3.45)).toBe('3.5km')
  })
})
