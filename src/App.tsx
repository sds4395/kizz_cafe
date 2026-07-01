import { useCallback, useEffect, useMemo, useState } from 'react'
import { SearchBar } from './components/SearchBar'
import { MapView } from './components/MapView'
import { CafeList } from './components/CafeList'
import { AddCafeForm } from './components/AddCafeForm'
import { useKakaoLoader } from './hooks/useKakaoLoader'
import { useCafes } from './hooks/useCafes'
import { geocode } from './lib/kakao'
import { distanceKm } from './lib/distance'
import type { GeoPoint, SearchResult } from './lib/types'

// 검색 전 기본 지도 중심 (서울시청)
const DEFAULT_CENTER: GeoPoint = { lat: 37.5663, lng: 126.9779 }

export default function App() {
  const { status: mapStatus, error: mapError } = useKakaoLoader()
  const { cafes, loading, error: cafesError, addCafe, backendEnabled } = useCafes()

  const [search, setSearch] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)

  // 현재 위치를 가져와 지도 중심으로 사용한다.
  // silent=true(최초 자동 요청)면 실패해도 배너를 띄우지 않는다.
  const locateUser = useCallback((silent = false) => {
    if (!('geolocation' in navigator)) {
      if (!silent) setLocateError('이 기기에서는 위치 정보를 사용할 수 없어요.')
      return
    }
    setLocating(true)
    if (!silent) setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setSearch(null) // 검색을 해제해 중심이 내 위치로 오도록
        setLocateError(null)
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (!silent) {
          setLocateError(
            err.code === err.PERMISSION_DENIED
              ? '위치 권한이 꺼져 있어요. 브라우저 설정에서 위치 접근을 허용해 주세요.'
              : '현재 위치를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
          )
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  // 최초 진입 시 자동으로 내 위치 요청 (거부돼도 조용히 기본 위치 사용)
  useEffect(() => {
    locateUser(true)
  }, [locateUser])

  const handleSearch = useCallback(async (query: string) => {
    setSearching(true)
    setSearchError(null)
    try {
      const result = await geocode(query)
      setSearch(result)
      setSelectedId(null)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : '검색에 실패했어요.')
    } finally {
      setSearching(false)
    }
  }, [])

  const onSelect = useCallback((id: string) => {
    setSelectedId(id)
    // 카드를 고르면 지도가 보이도록 화면 상단으로 부드럽게 이동
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // 지도 중심 우선순위: 검색 > 내 위치 > 기본(서울시청)
  const center = search ?? userLocation ?? DEFAULT_CENTER
  // 거리 표시·정렬 기준: 검색 > 내 위치
  const origin = search ?? userLocation

  // 기준 좌표(검색/내 위치)에서 가까운 순으로 정렬 (기준이 없으면 원래 순서)
  const sortedCafes = useMemo(() => {
    if (!origin) return cafes
    return [...cafes].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b))
  }, [cafes, origin])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🎈 우리동네 키즈카페</h1>
        <p className="app-sub">내가 아는, 아이랑 가기 좋은 곳을 함께 공유해요</p>
      </header>

      <SearchBar
        onSearch={handleSearch}
        onClear={() => {
          setSearch(null)
          setSelectedId(null)
        }}
        searching={searching}
        activeLabel={search?.label ?? null}
        disabled={mapStatus !== 'ready'}
      />

      {mapStatus === 'error' && (
        <div className="banner banner-error">
          지도를 불러오지 못했어요: {mapError}
          <br />
          카카오맵 JavaScript 키(VITE_KAKAO_MAP_KEY)와 등록된 도메인을 확인하세요.
        </div>
      )}
      {searchError && <div className="banner banner-warn">{searchError}</div>}
      {locateError && <div className="banner banner-warn">{locateError}</div>}
      {cafesError && <div className="banner banner-warn">{cafesError}</div>}
      {!backendEnabled && (
        <div className="banner banner-info">
          공유 백엔드(Supabase)가 아직 연결되지 않았어요. 지금은 기본 목록만 표시되고, 추가 기능은 비활성 상태예요.
        </div>
      )}

      <div className="map-wrap">
        {mapStatus === 'ready' ? (
          <MapView cafes={sortedCafes} center={center} selectedId={selectedId} onSelect={onSelect} />
        ) : (
          <div className="map-placeholder">
            {mapStatus === 'loading' ? '지도를 불러오는 중…' : '지도를 표시할 수 없어요'}
          </div>
        )}
        {mapStatus === 'ready' && (
          <button
            className={`map-locate-btn${locating ? ' is-locating' : ''}`}
            type="button"
            onClick={() => locateUser(false)}
            disabled={locating}
            aria-label="현재 위치로 이동"
            title="현재 위치로 이동"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3.5" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          </button>
        )}
      </div>

      <main className="list-section">
        <div className="list-head">
          <h2>
            {search ? `‘${search.label}’ 근처` : userLocation ? '내 위치 근처' : '전체 키즈카페'}
            <span className="count">{sortedCafes.length}곳</span>
          </h2>
        </div>
        {loading ? (
          <p className="list-empty">불러오는 중…</p>
        ) : (
          <CafeList cafes={sortedCafes} center={origin} selectedId={selectedId} onSelect={onSelect} />
        )}
      </main>

      <button className="fab" type="button" onClick={() => setShowAdd(true)} aria-label="키즈카페 추가">
        ＋ 추가
      </button>

      {showAdd && <AddCafeForm onClose={() => setShowAdd(false)} onSubmit={addCafe} />}
    </div>
  )
}
