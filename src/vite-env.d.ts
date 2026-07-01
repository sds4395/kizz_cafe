/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_MAP_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 카카오맵 SDK는 전역 window.kakao 로 주입된다 (별도 타입 패키지 없음)
interface Window {
  kakao: any
}
