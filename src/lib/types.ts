export type CafeSource = 'seed' | 'user'

/** 화면에 표시되는 키즈카페 한 곳 */
export interface Cafe {
  id: string
  name: string
  region: string // 시/도 + 구/군, 예: "서울 송파구"
  address: string // 전체 도로명/지번 주소
  lat: number
  lng: number
  description: string
  features: string[] // 특징 태그, 예: ["대형", "주차가능", "유아전용존"]
  phone?: string
  source: CafeSource
  createdAt?: string
}

export interface GeoPoint {
  lat: number
  lng: number
}

/** 주소 검색 결과(지도 중심으로 사용) */
export interface SearchResult extends GeoPoint {
  label: string
}

/** 사용자가 추가하는 입력값 (id/createdAt 은 서버에서 생성) */
export interface NewCafeInput {
  name: string
  region: string
  address: string
  lat: number
  lng: number
  description: string
  features: string[]
  phone?: string
}
