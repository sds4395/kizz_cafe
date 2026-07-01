import { useState, type FormEvent } from 'react'
import { searchPlaces, type PlaceResult } from '../lib/kakao'
import type { Cafe, NewCafeInput } from '../lib/types'

interface Props {
  onClose: () => void
  onSubmit: (input: NewCafeInput) => Promise<void>
  onAppend: (id: string, note: string) => Promise<void>
  cafes: Cafe[]
}

/** 주소 앞 2토큰을 지역 라벨로 사용 (예: "서울 송파구 올림픽로 300" → "서울 송파구") */
function regionFromAddress(address: string): string {
  return address.split(' ').slice(0, 2).join(' ')
}

const norm = (s: string) => (s || '').replace(/\s|동?점$/g, '').toLowerCase()

/** 카카오 검색 결과가 이미 등록된 카페인지 찾는다 (장소ID 우선, 없으면 이름+좌표 근접) */
function findRegistered(p: PlaceResult, cafes: Cafe[]): Cafe | null {
  const byId = cafes.find((c) => c.kakaoId && c.kakaoId === p.id)
  if (byId) return byId
  const pn = norm(p.name)
  return (
    cafes.find((c) => {
      const cn = norm(c.name)
      const nameMatch = cn === pn || cn.includes(pn) || pn.includes(cn)
      const near = Math.abs(c.lat - p.lat) < 0.003 && Math.abs(c.lng - p.lng) < 0.003 // 약 300m
      return nameMatch && near
    }) ?? null
  )
}

/**
 * 키즈카페 추가 폼(모달).
 * 이름으로 카카오맵을 검색 → 후보 선택 시 정보 자동 채움 → 설명만 입력.
 * 이미 등록된 곳은 목록에 '이미등록' 표시, 선택 시 기존 설명에 내용을 덧붙인다.
 */
export function AddCafeForm({ onClose, onSubmit, onAppend, cafes }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registered = selected ? findRegistered(selected, cafes) : null

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
    setError(null)

    // 이미 등록된 곳 → 기존 설명에 덧붙이기
    if (registered) {
      if (!description.trim()) {
        setError('덧붙일 내용을 입력해 주세요.')
        return
      }
      setSubmitting(true)
      try {
        await onAppend(registered.id, description.trim())
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : '설명 추가에 실패했어요.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // 신규 등록 → 카카오로 찾은 장소를 공공데이터로 치환해 저장
    setSubmitting(true)
    try {
      let src = {
        name: selected.name,
        address: selected.address,
        lat: selected.lat,
        lng: selected.lng,
      }
      try {
        const r = await fetch(
          `/api/place?lat=${selected.lat}&lng=${selected.lng}&name=${encodeURIComponent(selected.name)}`,
        )
        const pub = await r.json()
        if (pub && pub.ok) src = { name: pub.name, address: pub.address, lat: pub.lat, lng: pub.lng }
      } catch {
        /* 공공데이터 조회 실패 → 카카오 정보로 폴백 */
      }

      await onSubmit({
        name: src.name,
        address: src.address,
        region: regionFromAddress(src.address),
        lat: src.lat,
        lng: src.lng,
        description: description.trim(),
        features: [],
        kakaoId: selected.id,
        kakaoUrl: selected.placeUrl,
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
              {results.map((p) => {
                const reg = findRegistered(p, cafes)
                return (
                  <li key={p.id}>
                    <button type="button" className="place-item" onClick={() => setSelected(p)}>
                      <span className="place-item-main">
                        <span className="place-name">{p.name}</span>
                        <span className="place-addr">{p.address || '주소 정보 없음'}</span>
                        <span className="place-meta">
                          {p.category && (
                            <span className="place-cat">{p.category.split('>').pop()?.trim()}</span>
                          )}
                          {p.phone && <span className="place-phone">📞 {p.phone}</span>}
                        </span>
                      </span>
                      {reg && <span className="place-badge">이미등록</span>}
                    </button>
                  </li>
                )
              })}
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

            {registered ? (
              <>
                <div className="existing-note">
                  <span className="existing-note-label">이미 등록된 곳이에요 · 기존 설명</span>
                  <p className="existing-note-body">
                    {registered.description || '(등록된 설명이 없어요)'}
                  </p>
                </div>
                <label>
                  내용 덧붙이기 <span className="hint">(기존 설명 아래에 추가돼요)</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="예: 방문 후기, 추가 팁, 바뀐 정보 등"
                    autoFocus
                  />
                </label>
              </>
            ) : (
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
            )}

            {error && <p className="form-error">{error}</p>}

            <button className="submit-btn" type="submit" disabled={submitting}>
              {submitting ? '저장 중…' : registered ? '설명 덧붙이기' : '이 키즈카페 추가하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
