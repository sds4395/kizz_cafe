import { useCallback, useMemo, useState } from 'react'
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

  const center = search ?? DEFAULT_CENTER

  // 검색 좌표 기준 거리순 정렬 (검색 전에는 원래 순서)
  const sortedCafes = useMemo(() => {
    if (!search) return cafes
    return [...cafes].sort((a, b) => distanceKm(search, a) - distanceKm(search, b))
  }, [cafes, search])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🎈 우리동네 키즈카페</h1>
        <p className="app-sub">동네를 입력하면 가까운 대형 키즈카페를 찾아드려요</p>
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
      {cafesError && <div className="banner banner-warn">{cafesError}</div>}
      {!backendEnabled && (
        <div className="banner banner-info">
          공유 백엔드(Supabase)가 아직 연결되지 않았어요. 지금은 기본 목록만 표시되고, 추가 기능은 비활성 상태예요.
        </div>
      )}

      {mapStatus === 'ready' ? (
        <MapView cafes={sortedCafes} center={center} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <div className="map-placeholder">
          {mapStatus === 'loading' ? '지도를 불러오는 중…' : '지도를 표시할 수 없어요'}
        </div>
      )}

      <main className="list-section">
        <div className="list-head">
          <h2>
            {search ? `‘${search.label}’ 근처` : '전체 키즈카페'}
            <span className="count">{sortedCafes.length}곳</span>
          </h2>
        </div>
        {loading ? (
          <p className="list-empty">불러오는 중…</p>
        ) : (
          <CafeList cafes={sortedCafes} center={search} selectedId={selectedId} onSelect={onSelect} />
        )}
      </main>

      <button className="fab" type="button" onClick={() => setShowAdd(true)} aria-label="키즈카페 추가">
        ＋ 추가
      </button>

      {showAdd && <AddCafeForm onClose={() => setShowAdd(false)} onSubmit={addCafe} />}
    </div>
  )
}
