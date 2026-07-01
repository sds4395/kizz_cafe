// Vercel 서버리스 함수: 카카오로 찾은 장소를 공공데이터(소상공인)로 재조회.
// 인증키(SBIZ_API_KEY)는 서버 환경변수로만 사용 → 프런트에 노출되지 않음.
import { findPlace } from './_findPlace.mjs'

export default async function handler(req, res) {
  const { lat, lng, name } = req.query || {}
  const result = await findPlace({
    lat: Number(lat),
    lng: Number(lng),
    name: name || '',
    key: process.env.SBIZ_API_KEY,
  })
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(result)
}
