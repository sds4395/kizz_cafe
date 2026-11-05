// Vercel 서버리스 함수: 주소를 VWorld 지오코더로 좌표 변환.
// 인증키(VWORLD_API_KEY)는 서버 환경변수로만 사용 → 프런트에 노출되지 않음.
import { geocodeAddress } from './_geocode.mjs'

export default async function handler(req, res) {
  const { query } = req.query || {}
  const result = await geocodeAddress({
    query: query || '',
    key: process.env.VWORLD_API_KEY,
  })
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(result)
}
