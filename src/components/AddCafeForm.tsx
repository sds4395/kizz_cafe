import { useState, type FormEvent } from 'react'
import { searchPlaces, type PlaceResult } from '../lib/kakao'
import type { NewCafeInput } from '../lib/types'

interface Props {
  onClose: () => void
  onSubmit: (input: NewCafeInput) => Promise<void>
}

/** 주소 앞 2토큰을 지역 라벨로 사용 (예: "서울 송파구 올림픽로 300" → "서울 송파구") */
function regionFromAddress(address: string): string {
  return address.split(' ').slice(0, 2).join(' ')
}

/**
 * 키즈카페 추가 폼(모달).
 * 이름으로 카카오맵을 검색 → 후보를 선택하면 이름·주소·전화번호·좌표가 자동 채워지고,
 * 사용자는 설명(장점/특징)만 자유 입력한다.
 */
export function AddCafeForm({ onClose, onSubmit }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSearch = async (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    setSearched(false)
    try {
      setResults(await searchPlaces(query.trim()))
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했어요.')
    } finally {
      setSearching(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: selected.name,
        address: selected.address,
        region: regionFromAddress(selected.address),
        lat: selected.lat,
        lng: selected.lng,
        description: description.trim(),
        features: [],
        phone: selected.phone || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '추가에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="키즈카페 추가">
      <div className="modal">
        <div className="modal-head">
          <h2>키즈카페 추가</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {!selected ? (
          <div className="add-form">
            <form className="place-search" onSubmit={runSearch}>
              <label>
                키즈카페 이름으로 검색 <span className="hint">(선택하면 주소·전화가 자동 입력돼요)</span>
                <div className="place-search-row">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="예: 뽀로로파크 잠실"
                    autoFocus
                  />
                  <button
                    className="place-search-btn"
                    type="submit"
                    disabled={searching || !query.trim()}
                  >
                    {searching ? '검색 중…' : '검색'}
                  </button>
                </div>
              </label>
            </form>

            {error && <p className="form-error">{error}</p>}

            {searched && results.length === 0 && !error && (
              <p className="list-empty">검색 결과가 없어요. 다른 이름으로 시도해 보세요.</p>
            )}

            <ul className="place-results">
              {results.map((p) => (
                <li key={p.id}>
                  <button type="button" className="place-item" onClick={() => setSelected(p)}>
                    <span className="place-name">{p.name}</span>
                    <span className="place-addr">{p.address || '주소 정보 없음'}</span>
                    <span className="place-meta">
                      {p.category && <span className="place-cat">{p.category.split('>').pop()?.trim()}</span>}
                      {p.phone && <span className="place-phone">📞 {p.phone}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <form className="add-form" onSubmit={submit}>
            <div className="selected-place">
              <div className="selected-head">
                <h3 className="place-name">{selected.name}</h3>
                <button type="button" className="reselect-btn" onClick={() => setSelected(null)}>
                  다시 검색
                </button>
              </div>
              <p className="cafe-region">{regionFromAddress(selected.address)}</p>
              <p className="cafe-address">{selected.address || '주소 정보 없음'}</p>
              {selected.phone && <p className="selected-phone">📞 {selected.phone}</p>}
            </div>

            <label>
              설명 <span className="hint">(장점, 특징 등을 자유롭게)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="예: 2개 층 대형 실내 놀이터, 영유아 전용존, 주차 편리, 시간당 요금 등"
                autoFocus
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="submit-btn" type="submit" disabled={submitting}>
              {submitting ? '저장 중…' : '이 키즈카페 추가하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
