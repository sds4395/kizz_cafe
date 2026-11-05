// VWorld 지오코더로 주소 → 좌표(EPSG:4326) 변환.
// 공공데이터(소상공인)에 매칭되지 않은 카카오 검색결과를 저장할 때,
// 카카오 좌표 대신 공공 지오코더 좌표를 확보하려는 용도.
// dev(Vite 미들웨어)와 prod(Vercel 함수)에서 공용으로 사용.

const BASE = 'https://api.vworld.kr/req/address'

/**
 * 특정 주소 유형(ROAD=도로명, PARCEL=지번)으로 좌표 조회 시도.
 * @param {string} address
 * @param {string} key
 * @param {'ROAD'|'PARCEL'} type
 * @returns {Promise<{ok:true, lat:number, lng:number, address:string}|null>}
 */
async function tryType(address, key, type) {
  const url =
    `${BASE}?service=address&request=getcoord&version=2.0&crs=EPSG:4326` +
    `&type=${type}&address=${encodeURIComponent(address)}&format=json&key=${key}`
  const res = await fetch(url)
  const j = await res.json()
  const r = j && j.response
  if (r && r.status === 'OK' && r.result && r.result.point) {
    const lng = Number(r.result.point.x)
    const lat = Number(r.result.point.y)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { ok: true, lat, lng, address: (r.refined && r.refined.text) || address }
    }
  }
  return null
}

/**
 * 주소 문자열을 좌표로 변환한다. 도로명 우선, 실패 시 지번으로 재시도.
 * @param {{query:string, key:string}} p
 * @returns {Promise<{ok:boolean, lat?:number, lng?:number, address?:string, reason?:string}>}
 */
export async function geocodeAddress({ query, key }) {
  if (!key) return { ok: false, reason: 'no-key' }
  if (!query) return { ok: false, reason: 'no-query' }
  try {
    const road = await tryType(query, key, 'ROAD')
    if (road) return road
    const parcel = await tryType(query, key, 'PARCEL')
    if (parcel) return parcel
    return { ok: false, reason: 'not-found' }
  } catch (e) {
    return { ok: false, reason: 'fetch-failed' }
  }
}
