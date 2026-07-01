import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase 환경변수가 모두 설정된 경우에만 클라이언트를 생성한다.
 * 키가 없으면 null → 앱은 시드 데이터만으로(읽기 전용) 동작한다.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = supabase !== null

export const CAFES_TABLE = 'kids_cafes'
