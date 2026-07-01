import { useEffect, useRef } from 'react'
import type { Cafe, GeoPoint } from '../lib/types'

interface Props {
  cafes: Cafe[]
  center: GeoPoint
  selectedId: string | null
  onSelect: (id: string) => void
}

const DEFAULT_LEVEL = 6

const CENTER_PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">' +
  '<circle cx="14" cy="14" r="8" fill="#2563EB" stroke="white" stroke-width="3"/></svg>'

/** 카카오맵을 렌더링하고, 중심 좌표/카페 마커/선택 상태를 반영한다 */
export function MapView({ cafes, center, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const centerMarkerRef = useRef<any>(null)

  // 지도 최초 1회 생성
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const kakao = window.kakao
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: DEFAULT_LEVEL,
    })
    // center는 최초값만 사용; 이후 변화는 아래 별도 effect에서 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 중심 좌표 변경 → 지도 이동 + 중심 마커 갱신
  useEffect(() => {
    const kakao = window.kakao
    const map = mapRef.current
    if (!map) return

    const pos = new kakao.maps.LatLng(center.lat, center.lng)
    map.panTo(pos)

    centerMarkerRef.current?.setMap(null)
    const marker = new kakao.maps.Marker({
      position: pos,
      zIndex: 5,
      image: new kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,' + window.btoa(CENTER_PIN_SVG),
        new kakao.maps.Size(28, 28),
        { offset: new kakao.maps.Point(14, 14) },
      ),
    })
    marker.setMap(map)
    centerMarkerRef.current = marker
  }, [center.lat, center.lng])

  // 카페 목록 변경 → 마커 다시 그림
  useEffect(() => {
    const kakao = window.kakao
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = cafes.map((cafe) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(cafe.lat, cafe.lng),
        title: cafe.name,
      })
      kakao.maps.event.addListener(marker, 'click', () => onSelect(cafe.id))
      marker.setMap(map)
      return marker
    })
  }, [cafes, onSelect])

  // 선택된 카페로 부드럽게 이동
  useEffect(() => {
    if (!selectedId) return
    const kakao = window.kakao
    const map = mapRef.current
    const cafe = cafes.find((c) => c.id === selectedId)
    if (!map || !cafe) return
    map.panTo(new kakao.maps.LatLng(cafe.lat, cafe.lng))
  }, [selectedId, cafes])

  return <div className="map-view" ref={containerRef} />
}
