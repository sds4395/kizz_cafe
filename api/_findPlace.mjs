// 소상공인 상가정보 API로 좌표 주변의 공공데이터 업소를 찾아 반환한다.
// 카카오로 찾은 장소(좌표+이름)를 넘기면, 같은 업소의 "저장 가능한 공공데이터"를 돌려준다.
// dev(Vite 미들웨어)와 prod(Vercel 함수)에서 공용으로 사용.

const BASE = 'http://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius'

const norm = (s) => (s || '').replace(/\s|㈜|주식회사|\(.*?\)|점$/g, '').toLowerCase()

/**
 * @param {{lat:number,lng:number,name:string,key:string}} p
 * @returns {Promise<{ok:boolean, name?:string, address?:string, lat?:number, lng?:number, upjong?:string, reason?:string}>}
 */
export async function findPlace({ lat, lng, name, key }) {
  if (!key) return { ok: false, reason: 'no-key' }
  if (!lat || !lng) return { ok: false, reason: 'bad-coords' }

  const url = `${BASE}?serviceKey=${key}&pageNo=1&numOfRows=1000&radius=150&cx=${lng}&cy=${lat}&type=json`
  let j
  try {
    const res = await fetch(url)
    j = await res.json()
  } catch (e) {
    return { ok: false, reason: 'fetch-failed' }
  }
  const items = (j.body && j.body.items) || []
  if (!items.length) return { ok: false, reason: 'no-data' }

  const target = norm(name)
  let best = null
  let bestScore = -1
  for (const it of items) {
    const bn = norm(it.bizesNm)
    if (!bn) continue
    let score = 0
    if (target && (bn.includes(target) || target.includes(bn))) {
      score = 3
    } else if (target) {
      // 문자 겹침 비율(간이 유사도)
      const overlap = [...new Set(target)].filter((c) => bn.includes(c)).length
      const ratio = overlap / Math.max(target.length, 1)
      if (ratio >= 0.7) score = 1
    }
    if (score > bestScore) {
      bestScore = score
      best = it
    }
  }

  // 이름이 어느 정도 일치할 때만 채택 (엉뚱한 옆가게 매칭 방지)
  if (!best || bestScore < 1) return { ok: false, reason: 'no-name-match' }

  return {
    ok: true,
    name: best.bizesNm,
    address: (best.rdnmAdr || best.lnoAdr || '').replace(/^서울특별시/, '서울'),
    lat: Number(best.lat),
    lng: Number(best.lon),
    upjong: best.indsSclsNm || '',
  }
}
