import type { Cafe } from '../lib/types'
import { formatDistance } from '../lib/distance'

interface Props {
  cafe: Cafe
  distanceKm: number | null
  active: boolean
  onClick: () => void
}

/** 키즈카페 한 곳을 카드 형태로 표시 */
export function CafeCard({ cafe, distanceKm, active, onClick }: Props) {
  return (
    <button className={`cafe-card${active ? ' is-active' : ''}`} type="button" onClick={onClick}>
      <div className="cafe-card-head">
        <h3 className="cafe-name">{cafe.name}</h3>
        {distanceKm !== null && <span className="cafe-distance">{formatDistance(distanceKm)}</span>}
      </div>
      <p className="cafe-region">{cafe.region}</p>
      <p className="cafe-address">{cafe.address}</p>
      {cafe.description && <p className="cafe-desc">{cafe.description}</p>}
      <div className="cafe-tags">
        {cafe.features.map((f) => (
          <span className="cafe-tag" key={f}>
            #{f}
          </span>
        ))}
        {cafe.source === 'user' && <span className="cafe-tag tag-user">사용자 추가</span>}
      </div>
      {cafe.phone && (
        <a className="cafe-phone" href={`tel:${cafe.phone}`} onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 18 18" width="13" height="13" fill="none" aria-hidden="true">
            <path
              d="M4.1 3.2h2.1l1 2.9-1.4 1.3a7.6 7.6 0 0 0 3.6 3.6l1.3-1.4 2.9 1v2.1c0 .7-.6 1.2-1.3 1.1A11.6 11.6 0 0 1 3 4.5c-.1-.7.4-1.3 1.1-1.3Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          {cafe.phone}
        </a>
      )}
    </button>
  )
}
