import type { Cafe, GeoPoint } from '../lib/types'
import { distanceKm } from '../lib/distance'
import { CafeCard } from './CafeCard'

interface Props {
  cafes: Cafe[]
  center: GeoPoint | null
  selectedId: string | null
  onSelect: (id: string) => void
}

/** 키즈카페 목록. center가 있으면 각 카드에 거리 표시 */
export function CafeList({ cafes, center, selectedId, onSelect }: Props) {
  if (cafes.length === 0) {
    return (
      <p className="list-empty">
        근처에서 키즈카페를 찾지 못했어요. 검색 범위를 넓히거나 직접 추가해 보세요.
      </p>
    )
  }

  return (
    <ul className="cafe-list">
      {cafes.map((cafe) => (
        <li key={cafe.id}>
          <CafeCard
            cafe={cafe}
            distanceKm={center ? distanceKm(center, cafe) : null}
            active={cafe.id === selectedId}
            onClick={() => onSelect(cafe.id)}
          />
        </li>
      ))}
    </ul>
  )
}
