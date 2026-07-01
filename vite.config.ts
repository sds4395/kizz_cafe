import { defineConfig } from 'vitest/config'
import { loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error - JS 모듈(서버리스 함수와 공용)
import { findPlace } from './api/_findPlace.mjs'

/** 개발 서버에서 /api/place 를 Vercel 함수와 동일하게 처리 (인증키는 서버측에서만 사용) */
function devApiPlace(key: string): Plugin {
  return {
    name: 'dev-api-place',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/place')) return next()
        const url = new URL(req.url, 'http://localhost')
        const result = await findPlace({
          lat: Number(url.searchParams.get('lat')),
          lng: Number(url.searchParams.get('lng')),
          name: url.searchParams.get('name') || '',
          key,
        })
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // 모든 env 로드(VITE_ 접두사 아닌 것 포함)
  return {
    plugins: [react(), devApiPlace(env.SBIZ_API_KEY)],
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
