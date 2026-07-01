import type { SearchResult } from './types'

const SDK_ID = 'kakao-maps-sdk'
let loadPromise: Promise<void> | null = null

/** 카카오맵 SDK를 한 번만 동적으로 로드한다 (services 라이브러리 포함) */
export function loadKakaoSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window 없음'))
  if (window.kakao?.maps) return Promise.resolve()
  if (loadPromise) return loadPromise

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
  if (!appKey) {
    return Promise.reject(new Error('VITE_KAKAO_MAP_KEY 가 설정되지 않았습니다.'))
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const onload = () => window.kakao.maps.load(() => resolve())
    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null
    if (existing) {
      if (window.kakao?.maps) resolve()
      else existing.addEventListener('load', onload)
      return
    }

    const script = document.createElement('script')
    script.id = SDK_ID
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.onload = onload
    script.onerror = () => reject(new Error('카카오맵 SDK 로딩에 실패했습니다.'))
    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * 주소/키워드를 좌표로 변환한다.
 * 1) 주소 검색(addressSearch) 우선 → 실패 시 2) 키워드(장소) 검색으로 폴백.
 */
export function geocode(query: string): Promise<SearchResult> {
  return new Promise((resolve, reject) => {
    const kakao = window.kakao
    if (!kakao?.maps?.services) {
      reject(new Error('카카오맵 서비스가 아직 준비되지 않았습니다.'))
      return
    }

    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.addressSearch(query, (result: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && result.length > 0) {
        const top = result[0]
        resolve({ lat: parseFloat(top.y), lng: parseFloat(top.x), label: top.address_name ?? query })
        return
      }
      const places = new kakao.maps.services.Places()
      places.keywordSearch(query, (pRes: any[], pStatus: string) => {
        if (pStatus === kakao.maps.services.Status.OK && pRes.length > 0) {
          const top = pRes[0]
          resolve({ lat: parseFloat(top.y), lng: parseFloat(top.x), label: top.place_name ?? query })
        } else {
          reject(new Error('주소를 찾지 못했어요. 더 구체적으로 입력해 주세요. (예: 서울 송파구 잠실동)'))
        }
      })
    })
  })
}
